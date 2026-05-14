import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import { User } from "../../../entities/user.entity";
import { IPaginationParams } from "../../../interfaces/params.interface";
import roleEnum from "../../../enum/role.enum";
import { AppError } from "../../../errors";
import { returnAppointmentSchema } from "../../../schemas/appointments.schema";
import {
  APP_TIME_ZONE,
  formatDateTimeInTimeZone,
  getUtcRangeForLocalDate,
} from "../../../utils/timezone";

interface iGetAppointmentsParams extends IPaginationParams {
  date?: string | undefined;
  barberId?: string | undefined;
  userID: string;
  role: roleEnum;
}

const getAppointmentsService = async ({
  page = 1,
  limit = 10,
  date,
  barberId,
  userID,
  role,
}: iGetAppointmentsParams): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
}> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const userRepo = AppDataSource.getRepository(User);

  const queryBuilder = appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.barber", "barber")
    .leftJoinAndSelect("appointment.client", "client")
    .leftJoinAndSelect("appointment.shop", "shop")
    .leftJoinAndSelect("appointment.appointmentServices", "as")
    .leftJoinAndSelect("as.service", "service");

  if (role === roleEnum.ADMIN) {
  } else if (role === roleEnum.MANAGER) {
    const manager = await userRepo.findOne({
      where: { id: userID },
      relations: ["shop"],
    });
    if (!manager || !manager.shop) {
      throw new AppError("Gerente não associado a uma loja", 403);
    }
    queryBuilder.andWhere("appointment.shop_id = :shopId", {
      shopId: manager.shop.id,
    });
  } else if (role === roleEnum.BARBER) {
    queryBuilder.andWhere("barber.id = :userID", { userID });
  } else {
    queryBuilder.andWhere("client.id = :userID", { userID });
  }

  if (barberId) {
    queryBuilder.andWhere("barber.id = :barberId", { barberId });
  }

  if (date) {
    const { start, end } = getUtcRangeForLocalDate(date, APP_TIME_ZONE);
    queryBuilder.andWhere("appointment.startTime BETWEEN :start AND :end", {
      start,
      end,
    });
  }

  const [appointments, total] = await queryBuilder
    .orderBy("appointment.startTime", "DESC")
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const formattedAppointments = appointments.map((app) => {
    const obj = {
      ...app,
      startTime: formatDateTimeInTimeZone(app.startTime, APP_TIME_ZONE),
      endTime: formatDateTimeInTimeZone(app.endTime, APP_TIME_ZONE),
      services: app.appointmentServices.map((as) => as.service),
    };
    return returnAppointmentSchema.parse(obj);
  });

  return {
    data: formattedAppointments,
    total,
    page,
    limit,
  };
};

export default getAppointmentsService;
