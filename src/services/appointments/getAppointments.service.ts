import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { IPaginationParams } from "../../interfaces/params.interface";

const getAppointmentsService = async ({
  page = 1,
  limit = 10,
}: IPaginationParams): Promise<{
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const [appointments, total] = await appointmentRepo
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
    ])
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
