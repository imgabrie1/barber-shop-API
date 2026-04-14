import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import appointmentStatusEnum from "../../enum/appointmentStatus.enum";
import roleEnum from "../../enum/role.enum";
import { AppError } from "../../errors";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../../utils/timezone";

const updateAppointmentStatusService = async (
  appointmentID: string,
  newStatus: appointmentStatusEnum,
  userID: string,
  userRole: string,
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

  const currentStatus = appointment.status as appointmentStatusEnum;

  const validTransitions: Record<
    appointmentStatusEnum,
    appointmentStatusEnum[]
  > = {
    [appointmentStatusEnum.PENDING]: [
      appointmentStatusEnum.PENDING,
      appointmentStatusEnum.CONFIRMED,
      appointmentStatusEnum.CANCELLED,
    ],
    [appointmentStatusEnum.CONFIRMED]: [
      appointmentStatusEnum.CONFIRMED,
      appointmentStatusEnum.COMPLETED,
      appointmentStatusEnum.CANCELLED,
      appointmentStatusEnum.NO_SHOW,
    ],
    [appointmentStatusEnum.COMPLETED]: [appointmentStatusEnum.COMPLETED],
    [appointmentStatusEnum.CANCELLED]: [appointmentStatusEnum.CANCELLED],
    [appointmentStatusEnum.NO_SHOW]: [appointmentStatusEnum.NO_SHOW],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new AppError(
      `Não é possível alterar o status de ${currentStatus} para ${newStatus}`,
      400,
    );
  }

  if (currentStatus === newStatus) {
    const formattedAppointment = {
      ...appointment,
      startTime: formatDateTimeInTimeZone(appointment.startTime, APP_TIME_ZONE),
      endTime: formatDateTimeInTimeZone(appointment.endTime, APP_TIME_ZONE),
      services: appointment.appointmentServices.map((as) => as.service),
    };

    return returnAppointmentSchema.parse(formattedAppointment);
  }

  const isOwner = appointment.client.id === userID;
  const isBarber = appointment.barber.id === userID;
  const isAdmin = userRole === roleEnum.ADMIN;

  if (newStatus === appointmentStatusEnum.CANCELLED) {
    if (!isOwner && !isAdmin && !isBarber) {
      throw new AppError("Sem permissão para cancelar otario", 403);
    }
  }

  if (newStatus === appointmentStatusEnum.CONFIRMED) {
    if (!isBarber && !isAdmin) {
      throw new AppError("Sem permissão para confirmar", 403);
    }
  }

  if (
    newStatus === appointmentStatusEnum.COMPLETED ||
    newStatus === appointmentStatusEnum.NO_SHOW
  ) {
    if (!isBarber && !isAdmin) {
      throw new AppError("Sem permissão para alterar este status", 403);
    }
  }

  appointment.status = newStatus;
  await appointmentRepo.save(appointment);

  const formattedAppointment = {
    ...appointment,
    startTime: formatDateTimeInTimeZone(appointment.startTime, APP_TIME_ZONE),
    endTime: formatDateTimeInTimeZone(appointment.endTime, APP_TIME_ZONE),
    services: appointment.appointmentServices.map((as) => as.service),
  };

  return returnAppointmentSchema.parse(formattedAppointment);
};

export default updateAppointmentStatusService;
