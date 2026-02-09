import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import appointmentStatusEnum from "../../enum/appointmentStatus.enum";
import { AppError } from "../../errors";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../../utils/timezone";

const userCancelAppointmentService = async (
  appointmentID: string,
  userID: string,
) => {
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

  if (appointment.client.id !== userID) {
    throw new AppError(
      "Você não tem permissão para cancelar este agendamento",
      403,
    );
  }

  if (
    appointment.status !== appointmentStatusEnum.PENDING &&
    appointment.status !== appointmentStatusEnum.CONFIRMED
  ) {
    throw new AppError(
      `Não é possível cancelar um agendamento com status: ${appointment.status}`,
      400,
    );
  }

  appointment.status = appointmentStatusEnum.CANCELLED;
  await appointmentRepo.save(appointment);

  const formattedAppointment = {
    ...appointment,
    startTime: formatDateTimeInTimeZone(appointment.startTime, APP_TIME_ZONE),
    endTime: formatDateTimeInTimeZone(appointment.endTime, APP_TIME_ZONE),
    services: appointment.appointmentServices.map((as) => as.service),
  };

  return returnAppointmentSchema.parse(formattedAppointment);
};

export default userCancelAppointmentService;
