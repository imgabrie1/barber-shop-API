import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { IPaginationParams } from "../../interfaces/params.interface";
import { Between } from "typeorm";

interface iGetAppointmentsParams extends IPaginationParams {
  date?: string;
  barberId?: string;
}

const getAppointmentsService = async ({
  page = 1,
  limit = 10,
  date,
  barberId,
}: iGetAppointmentsParams): Promise<{
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const queryBuilder = appointmentRepo
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

  if (barberId) {
    queryBuilder.andWhere("barber.id = :barberId", { barberId });
  }

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    queryBuilder.andWhere("appointment.startTime BETWEEN :start AND :end", {
      start: startOfDay,
      end: endOfDay,
    });
  }

  const [appointments, total] = await queryBuilder
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

export default getAppointmentsService;