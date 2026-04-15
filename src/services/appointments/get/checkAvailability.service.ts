import { Between, In } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import { Service } from "../../../entities/services.entity";
import appointmentStatusEnum from "../../../enum/appointmentStatus.enum";
import { AppError } from "../../../errors";
import {
  BUSINESS_END_MINUTES,
  BUSINESS_START_MINUTES,
  ensureWithinBusinessHours,
} from "../../../utils/appointmentBusinessHours";
import {
  APP_TIME_ZONE,
  formatTimeInTimeZone,
  getUtcRangeForLocalDate,
  toUtcDate,
} from "../../../utils/timezone";

interface iCheckAvailabilityRequest {
  barberId?: string;
  date?: string;
  serviceIds?: string[];
  durationMinutes?: number;
  slotMinutes?: number;
}

const isValidDateOnly = (value: string): boolean =>
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value);

const checkAvailabilityService = async ({
  barberId,
  date,
  serviceIds,
  durationMinutes,
  slotMinutes = 15,
}: iCheckAvailabilityRequest): Promise<string[]> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const serviceRepo = AppDataSource.getRepository(Service);

  if (!date) {
    throw new AppError("Data é obrigatória", 400);
  }

  if (!isValidDateOnly(date)) {
    throw new AppError("Formato de data inválido. Use YYYY-MM-DD", 400);
  }

  if (slotMinutes <= 0 || slotMinutes > 60) {
    throw new AppError("Intervalo de slots inválido", 400);
  }

  let totalDurationMinutes = durationMinutes ?? 30;
  if (serviceIds && serviceIds.length > 0) {
    const services = await serviceRepo.findBy({ id: In(serviceIds) });
    if (services.length !== serviceIds.length) {
      throw new AppError("Um ou mais serviços não foram encontrados", 404);
    }
    totalDurationMinutes = services.reduce(
      (acc, service) => acc + service.durationMinutes,
      0,
    );
  }

  if (totalDurationMinutes <= 0) {
    throw new AppError("Duração do serviço inválida", 400);
  }

  const where: any = {};

  if (barberId) {
    where.barber = { id: barberId };
  }

  if (date) {
    const { start, end } = getUtcRangeForLocalDate(date, APP_TIME_ZONE);
    where.startTime = Between(start, end);
  }

  where.status = In([
    appointmentStatusEnum.PENDING,
    appointmentStatusEnum.CONFIRMED,
  ]);

  const existingAppointments = await appointmentRepo.find({
    where,
    order: { startTime: "ASC" },
  });

  const busyIntervals = existingAppointments.map((appointment) => ({
    start: appointment.startTime,
    end: appointment.endTime,
  }));

  const totalBusinessMinutes = BUSINESS_END_MINUTES - BUSINESS_START_MINUTES;
  if (totalDurationMinutes > totalBusinessMinutes) {
    throw new AppError("Duração do serviço excede o horário comercial", 400);
  }

  const startHour = Math.floor(BUSINESS_START_MINUTES / 60)
    .toString()
    .padStart(2, "0");

  const startMinute = (BUSINESS_START_MINUTES % 60).toString().padStart(2, "0");

  const dayStartLocal = `${date}T${startHour}:${startMinute}`;
  const firstSlotStart = toUtcDate(dayStartLocal, APP_TIME_ZONE);
  const firstSlotEnd = new Date(
    firstSlotStart.getTime() + totalDurationMinutes * 60000,
  );
  ensureWithinBusinessHours(firstSlotStart, firstSlotEnd);

  const availableSlots: string[] = [];
  const lastStartMinutes = BUSINESS_END_MINUTES - totalDurationMinutes;

  for (
    let minute = BUSINESS_START_MINUTES;
    minute <= lastStartMinutes;
    minute += slotMinutes
  ) {
    const hours = Math.floor(minute / 60);
    const minutes = minute % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const slotStart = toUtcDate(`${date}T${hh}:${mm}`, APP_TIME_ZONE);
    const slotEnd = new Date(
      slotStart.getTime() + totalDurationMinutes * 60000,
    );

    const hasConflict = busyIntervals.some(
      (busy) => slotStart < busy.end && slotEnd > busy.start,
    );

    if (!hasConflict) {
      availableSlots.push(formatTimeInTimeZone(slotStart, APP_TIME_ZONE));
    }
  }

  return availableSlots;
};

export default checkAvailabilityService;
