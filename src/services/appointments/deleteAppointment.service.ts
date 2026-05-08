import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import roleEnum from "../../enum/role.enum";

const deleteAppointmentService = async (
  userID: string,
  appointmentID: string,
  role: roleEnum,
): Promise<void> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const userRepo = AppDataSource.getRepository(User);

  const appointment = await appointmentRepo.findOne({
    where: { id: appointmentID },
    relations: ["client", "barber", "shop"],
  });

  if (!appointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  const user = await userRepo.findOne({
    where: { id: userID },
    relations: ["shop"],
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  let hasPermission = false;

  if (role === roleEnum.ADMIN) {
    hasPermission = true;
  } else if (role === roleEnum.MANAGER) {
    if (user.shop && appointment.shop && user.shop.id === appointment.shop.id) {
      hasPermission = true;
    }
  } else if (role === roleEnum.BARBER) {
    if (appointment.barber.id === userID) {
      hasPermission = true;
    }
  } else if (role === roleEnum.CLIENT) {
    if (appointment.client.id === userID) {
      hasPermission = true;
    }
  }

  if (!hasPermission) {
    throw new AppError("Sem permissão para deletar este agendamento", 403);
  }

  await appointmentRepo.delete(appointmentID);
};

export default deleteAppointmentService;
