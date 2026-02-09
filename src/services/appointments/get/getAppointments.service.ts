import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import { IPaginationParams } from "../../../interfaces/params.interface";
import { Between } from "typeorm";
import { returnAppointmentSchema } from "../../../schemas/appointments.schema";
import z from "zod";
import {
  APP_TIME_ZONE,
  formatDateTimeInTimeZone,
  getUtcRangeForLocalDate,
} from "../../../utils/timezone";

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
    const { start, end } = getUtcRangeForLocalDate(date, APP_TIME_ZONE);
    queryBuilder.andWhere("appointment.startTime BETWEEN :start AND :end", {
      start,
      end,
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
      startTime: formatDateTimeInTimeZone(app.startTime, APP_TIME_ZONE),
      endTime: formatDateTimeInTimeZone(app.endTime, APP_TIME_ZONE),
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
