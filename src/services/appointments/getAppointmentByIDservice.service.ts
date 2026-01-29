import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { AppError } from "../../errors";

const getAppointmentByIDservice = async (
appointmentID: string,
): Promise<Appointment | null> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const appointment = appointmentRepo
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
    .where("appointment.id = :appointmentID", { appointmentID })
    .getOne();
  if (!appointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }
  return appointment;
};
export default getAppointmentByIDservice;
