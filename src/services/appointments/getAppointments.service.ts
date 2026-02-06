import { AppDataSource } from "../../data-source";
import { Appointment } from "../../entities/appointments.entity";
import { IPaginationParams } from "../../interfaces/params.interface";
import { Between } from "typeorm";
import { returnAppointmentSchema } from "../../schemas/appointments.schema";
import z from "zod";

interface iGetAppointmentsParams extends IPaginationParams {
  date?: string;
  barberId?: string;
}

const getAppointmentsService = async ({
  page = 1,
  limit = 10,
  date,
  barberId,
}: iGetAppointmentsParams): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
}> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  const queryBuilder = appointmentRepo
    .createQueryBuilder("appointment")
    .leftJoinAndSelect("appointment.barber", "barber")
    .leftJoinAndSelect("appointment.client", "client")
    .leftJoinAndSelect("appointment.appointmentServices", "as")
    .leftJoinAndSelect("as.service", "service");

  if (barberId) {
    queryBuilder.andWhere("barber.id = :barberId", { barberId });
  }

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    queryBuilder.andWhere("appointment.startTime BETWEEN :start AND :end", {
      start: startOfDay,
      end: endOfDay,
    });
  }

  const [appointments, total] = await queryBuilder
    .orderBy("appointment.startTime", "DESC")
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const formattedAppointments = appointments.map((app) => {
    const obj = {
      ...app,
      services: app.appointmentServices.map((as) => as.service),
    };
    return returnAppointmentSchema.parse(obj);
  });

  return {
    data: formattedAppointments,
    total,
    page,
    limit,
  };
};

export default getAppointmentsService;