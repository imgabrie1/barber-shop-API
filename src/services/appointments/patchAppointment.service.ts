import { In, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { AppointmentService } from "../../entities/appointmentServices.entity";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";
import { iAppointmentReturn } from "../../interfaces/appointments.interface";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";
import { ensureWithinBusinessHours } from "../../utils/appointmentBusinessHours";
import {
  APP_TIME_ZONE,
  formatDateTimeInTimeZone,
  toUtcDate,
} from "../../utils/timezone";

const patchAppointmentService = async (
  updatedData: any,
  appointmentID: string,
  userID: string,
): Promise<iAppointmentReturn> => {
  const result = await AppDataSource.transaction(
    async (transactionalEntityManager) => {
      const appointmentRepo =
        transactionalEntityManager.getRepository(Appointment);
      const serviceRepo = transactionalEntityManager.getRepository(Service);
      const appointmentServiceRepo =
        transactionalEntityManager.getRepository(AppointmentService);

      const oldAppointment = await appointmentRepo.findOne({
        where: { id: appointmentID },
        relations: ["barber", "client"],
      });

      if (!oldAppointment) {
        throw new AppError("Agendamento não encontrado", 404);
      }

      if (
        oldAppointment.client.id !== userID &&
        oldAppointment.barber.id !== userID
      ) {
        throw new AppError("Tu nem podia tá aqui...", 403);
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
        ? toUtcDate(updatedData.startTime, APP_TIME_ZONE)
        : oldAppointment.startTime;
      const endTime = new Date(
        startTime.getTime() + totalDurationMinutes * 60000,
      );

      ensureWithinBusinessHours(startTime, endTime);

      const conflict = await transactionalEntityManager
        .createQueryBuilder(Appointment, "appointment")
        .where("appointment.barber_id = :barberId", {
          barberId: oldAppointment.barber.id,
        })
        .andWhere("appointment.id != :id", { id: appointmentID })
        .andWhere("appointment.startTime < :endTime", { endTime })
        .andWhere("appointment.endTime > :startTime", { startTime })
        .getOne();

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

      return {
        ...oldAppointment,
        startTime: formatDateTimeInTimeZone(oldAppointment.startTime, APP_TIME_ZONE),
        endTime: formatDateTimeInTimeZone(oldAppointment.endTime, APP_TIME_ZONE),
        services: services,
      };
    },
  );

  return returnAppointmentSchema.parse(result);
};

export default patchAppointmentService;
