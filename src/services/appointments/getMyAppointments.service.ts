import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import roleEnum from "../../enum/role.enum";
import { AppError } from "../../errors";
import { IPaginationParams } from "../../interfaces/params.interface";

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
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const qb = appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoin("appointment.barber", "barber")
    .leftJoin("appointment.client", "client")
    .select([
      "appointment.id",
      "appointment.startTime",
      "appointment.endTime",

      "barber.id",
      "barber.name",
      "barber.role",
      "barber.phoneNumber",

      "client.id",
      "client.name",
      "client.role",
      "client.phoneNumber",
    ]);
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

  return {
    data: appointments,
    total,
    page,
    limit,
  };
};

export default getMyAppointmentsService;
