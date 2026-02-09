import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import roleEnum from "../../../enum/role.enum";
import { AppError } from "../../../errors";
import { IPaginationParams } from "../../../interfaces/params.interface";
import { returnAppointmentSchema } from "../../../schemas/appointments.schema";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../../../utils/timezone";


interface IGetMyAppointmentsParams extends IPaginationParams {
  userId: string;
  role: roleEnum;
}

const getMyAppointmentsService = async ({
  userId,
  role,
  page = 1,
  limit = 10,
}: IGetMyAppointmentsParams): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
}> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const qb = appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.barber", "barber")
    .leftJoinAndSelect("appointment.client", "client")
    .leftJoinAndSelect("appointment.appointmentServices", "as")
    .leftJoinAndSelect("as.service", "service");

  if (!userId) {
    throw new AppError("Usuário não autenticado", 401);
  }

  switch (role) {
    case roleEnum.CLIENT:
      qb.where("client.id = :userId", { userId });
      break;

    case roleEnum.BARBER:
      qb.where("barber.id = :userId", { userId });
      break;

    case roleEnum.ADMIN:
      qb.where("client.id = :userId OR barber.id = :userId", { userId });
      break;

    default:
      throw new AppError("Acesso negado", 403);
  }

  const [appointments, total] = await qb
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

export default getMyAppointmentsService;
