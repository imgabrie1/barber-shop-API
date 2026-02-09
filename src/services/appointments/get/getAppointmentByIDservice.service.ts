import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import { AppError } from "../../../errors";
import { returnAppointmentSchema } from "../../../schemas/appointments.schema";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../../../utils/timezone";


const getAppointmentByIDservice = async (
  appointmentID: string,
): Promise<any | null> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const appointment = await appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.barber", "barber")
    .leftJoinAndSelect("appointment.client", "client")
    .leftJoinAndSelect("appointment.appointmentServices", "as")
    .leftJoinAndSelect("as.service", "service")
    .where("appointment.id = :appointmentID", { appointmentID })
    .getOne();

  if (!appointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  const formattedAppointment = {
    ...appointment,
    startTime: formatDateTimeInTimeZone(appointment.startTime, APP_TIME_ZONE),
    endTime: formatDateTimeInTimeZone(appointment.endTime, APP_TIME_ZONE),
    services: appointment.appointmentServices.map((as) => as.service),
  };

  return returnAppointmentSchema.parse(formattedAppointment);
};
export default getAppointmentByIDservice;
