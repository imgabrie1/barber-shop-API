import { In, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { AppointmentService } from "../../entities/appointmentServices.entity";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";
import { iAppointmentReturn } from "../../interfaces/appointments.interface";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";

const patchAppointmentService = async (
  updatedData: any,
  appointmentID: string,
): Promise<iAppointmentReturn> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const serviceRepo = AppDataSource.getRepository(Service);
  const appointmentServiceRepo =
    AppDataSource.getRepository(AppointmentService);

  const oldAppointment = await appointmentRepo.findOne({
    where: { id: appointmentID },
    relations: ["barber", "client"],
  });

  if (!oldAppointment) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  let services: Service[] = [];

  if (updatedData.serviceIds) {
    services = await serviceRepo.findBy({
      id: In(updatedData.serviceIds),
    });

    if (services.length !== updatedData.serviceIds.length) {
      throw new AppError("Um ou mais serviços não foram encontrados", 404);
    }
  } else {
    const currentAppointmentServices = await appointmentServiceRepo.find({
      where: { appointment_id: appointmentID },
      relations: ["service"],
    });
    services = currentAppointmentServices.map((as) => as.service);
  }

  const totalDurationMinutes = services.reduce(
    (acc, service) => acc + service.durationMinutes,
    0,
  );

  const startTime = updatedData.startTime
    ? new Date(updatedData.startTime)
    : oldAppointment.startTime;
  const endTime = new Date(startTime.getTime() + totalDurationMinutes * 60000);

  const conflictingAppointment = await appointmentRepo.findOne({
    where: {
      id: MoreThan(appointmentID),
      barber: { id: oldAppointment.barber.id },
      startTime: LessThan(endTime),
      endTime: MoreThan(startTime),
    },
  });

  const queryBuilder = appointmentRepo
    .createQueryBuilder("appointment")
    .where("appointment.barber_id = :barberId", {
      barberId: oldAppointment.barber.id,
    })
    .andWhere("appointment.id != :id", { id: appointmentID })
    .andWhere("appointment.startTime < :endTime", { endTime })
    .andWhere("appointment.endTime > :startTime", { startTime });

  const conflict = await queryBuilder.getOne();

  if (conflict) {
    throw new AppError(
      "O barbeiro já possui um agendamento neste horário",
      409,
    );
  }

  oldAppointment.startTime = startTime;
  oldAppointment.endTime = endTime;

  await appointmentRepo.save(oldAppointment);

  if (updatedData.serviceIds) {
    await appointmentServiceRepo.delete({ appointment_id: appointmentID });

    const appointmentServices = services.map((service) => {
      return appointmentServiceRepo.create({
        appointment_id: appointmentID,
        service_id: service.id,
      });
    });

    await appointmentServiceRepo.save(appointmentServices);
  }

  const appointmentReturn = {
    ...oldAppointment,
    services: services,
  };

  return returnAppointmentSchema.parse(appointmentReturn);
};

export default patchAppointmentService;
