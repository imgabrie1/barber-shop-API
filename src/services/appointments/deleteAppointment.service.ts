import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import roleEnum from "../../enum/role.enum";

const deleteAppointmentService = async (
  userID: string,
  appointmentID: string,
): Promise<void> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const userRepo = AppDataSource.getRepository(User);

  const appointment = await appointmentRepo.findOne({
    where: { id: appointmentID },
    relations: ["client", "barber"],
  });

  if (!appointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  const user = await userRepo.findOneBy({ id: userID });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  const isOwner = appointment.client.id === userID;
  const isBarber = appointment.barber.id === userID;
  const isAdmin = user.role === roleEnum.ADMIN;

  const hasPermission = isOwner || isBarber || isAdmin;

  if (!hasPermission) {
    throw new AppError("Sem permissão para deletar este agendamento", 403);
  }

  await appointmentRepo.delete(appointmentID);
};

export default deleteAppointmentService;
