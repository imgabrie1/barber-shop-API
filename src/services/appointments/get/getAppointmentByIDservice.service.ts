import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import { User } from "../../../entities/user.entity";
import roleEnum from "../../../enum/role.enum";
import { AppError } from "../../../errors";
import { returnAppointmentSchema } from "../../../schemas/appointments.schema";
import { APP_TIME_ZONE, formatDateTimeInTimeZone } from "../../../utils/timezone";


const getAppointmentByIDservice = async (
  appointmentID: string,
  userID: string,
  role: roleEnum,
): Promise<any | null> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const userRepo = AppDataSource.getRepository(User);

  const appointment = await appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.barber", "barber")
    .leftJoinAndSelect("appointment.client", "client")
    .leftJoinAndSelect("appointment.shop", "shop")
    .leftJoinAndSelect("appointment.appointmentServices", "as")
    .leftJoinAndSelect("as.service", "service")
    .where("appointment.id = :appointmentID", { appointmentID })
    .getOne();

  if (!appointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  if (role === roleEnum.ADMIN) {
  } else if (role === roleEnum.MANAGER) {
    const manager = await userRepo.findOne({
      where: { id: userID },
      relations: ["shop"],
    });
    if (!manager || !manager.shop || appointment.shop.id !== manager.shop.id) {
      throw new AppError("Acesso negado", 403);
    }
  } else if (role === roleEnum.BARBER) {
    if (appointment.barber.id !== userID) {
      throw new AppError("Acesso negado", 403);
    }
  } else {
    if (appointment.client.id !== userID) {
      throw new AppError("Acesso negado", 403);
    }
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
