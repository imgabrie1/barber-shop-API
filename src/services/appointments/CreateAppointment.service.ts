import { AppDataSource } from "../../data-source";
import { AppError } from "../../errors";
import { Appointment } from "../../entities/appointments.entity";
import { User } from "../../entities/user.entity";
import { Service } from "../../entities/services.entity";
import { AppointmentService } from "../../entities/appointmentServices.entity";
import {
  iAppointment,
  iAppointmentReturn,
} from "../../interfaces/appointments.interface";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";
import { In, LessThan, MoreThan } from "typeorm";
import roleEnum from "../../enum/role.enum";

const createAppointmentService = async (
  appointmentData: iAppointment,
  clientId: string,
): Promise<iAppointmentReturn> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const userRepo = AppDataSource.getRepository(User);
  const serviceRepo = AppDataSource.getRepository(Service);
  const appointmentServiceRepo =
    AppDataSource.getRepository(AppointmentService);

  const { barberId, serviceIds, startTime } = appointmentData;

  const client = await userRepo.findOneBy({ id: clientId });
  if (!client) {
    throw new AppError("Cliente não encontrado", 404);
  }

  const barber = await userRepo.findOneBy({ id: barberId });
  if (!barber) {
    throw new AppError("Barbeiro não encontrado", 404);
  }
  if (barber.role !== roleEnum.BARBER) {
    throw new AppError("O usuário informado não é um barbeiro", 400);
  }

  const services = await serviceRepo.findBy({
    id: In(serviceIds),
  });

  if (services.length !== serviceIds.length) {
    throw new AppError("Um ou mais serviços não foram encontrados", 404);
  }

  const totalDurationMinutes = services.reduce(
    (acc, service) => acc + service.durationMinutes,
    0,
  );

  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + totalDurationMinutes * 60000);

  const conflictingAppointment = await appointmentRepo.findOne({
    where: {
      barber: { id: barberId },
      startTime: LessThan(endDate),
      endTime: MoreThan(startDate),
    },
  });

  if (conflictingAppointment) {
    throw new AppError(
      "O barbeiro já possui um agendamento neste horário",
      409,
    );
  }

  const newAppointment = appointmentRepo.create({
    startTime: startDate,
    endTime: endDate,
    client: client,
    barber: barber,
  });

  await appointmentRepo.save(newAppointment);

  const appointmentServices = services.map((service) => {
    return appointmentServiceRepo.create({
      appointment: newAppointment,
      service: service,
      appointment_id: newAppointment.id,
      service_id: service.id,
    });
  });

  await appointmentServiceRepo.save(appointmentServices);

  const appointmentReturn = {
    ...newAppointment,
    services: services,
  };

  return returnAppointmentSchema.parse(appointmentReturn);
};

export default createAppointmentService;
