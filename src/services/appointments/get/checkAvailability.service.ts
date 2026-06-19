import { Between, In } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { Appointment } from "../../../entities/appointments.entity";
import { Service } from "../../../entities/services.entity";
import { Shop } from "../../../entities/shop.entity";
import appointmentStatusEnum from "../../../enum/appointmentStatus.enum";
import { AppError } from "../../../errors";
import {
  APP_TIME_ZONE,
  formatTimeInTimeZone,
  getUtcRangeForLocalDate,
  toUtcDate,
} from "../../../utils/timezone";

interface iCheckAvailabilityRequest {
  barberId?: string;
  shopId?: string;
  date?: string;
  serviceIds?: string[];
  durationMinutes?: number;
  slotMinutes?: number;
}

const isValidDateOnly = (value: string): boolean =>
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value);

const checkAvailabilityService = async ({
  barberId,
  shopId,
  date,
  serviceIds,
  durationMinutes,
  slotMinutes = 15,
}: iCheckAvailabilityRequest): Promise<string[]> => {
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const serviceRepo = AppDataSource.getRepository(Service);
  const shopRepo = AppDataSource.getRepository(Shop);

  if (!date) throw new AppError("Data é obrigatória", 400);
  if (!isValidDateOnly(date))
    throw new AppError("Formato de data inválido. Use YYYY-MM-DD", 400);
  if (!shopId) throw new AppError("shopId é obrigatório", 400);

  const shop = await shopRepo.findOne({
    where: { id: shopId },
    relations: ["schedules"],
  });
  if (!shop) throw new AppError("Loja não encontrada", 404);

  const dateObj = new Date(`${date}T12:00:00Z`);
  const dayOfWeek = dateObj.getDay();

  const daySchedule = shop.schedules?.find(s => s.dayOfWeek === dayOfWeek);

  if (!shop.alwaysOpen && (!daySchedule || !daySchedule.isOpen)) {
    return [];
  }

  const currentStartMinutes = shop.alwaysOpen ? 0 : daySchedule!.startHour * 60;
  const currentEndMinutes = shop.alwaysOpen ? 24 * 60 : daySchedule!.endHour * 60;

  let totalDurationMinutes = durationMinutes ?? 30;
  if (serviceIds && serviceIds.length > 0) {
    const services = await serviceRepo.findBy({ id: In(serviceIds) });
    totalDurationMinutes = services.reduce(
      (acc, s) => acc + s.durationMinutes,
      0,
    );
  }

  const where: any = {};
  if (barberId) where.barber = { id: barberId };
  if (date) {
    const { start, end } = getUtcRangeForLocalDate(date, APP_TIME_ZONE);
    where.startTime = Between(start, end);
  }
  where.status = In([
    appointmentStatusEnum.PENDING,
    appointmentStatusEnum.CONFIRMED,
  ]);

  const existingAppointments = await appointmentRepo.find({ where });
  const busyIntervals = existingAppointments.map((app) => ({
    start: app.startTime,
    end: app.endTime,
  }));

  if (totalDurationMinutes > currentEndMinutes - currentStartMinutes) {
    throw new AppError(
      "Duração do serviço excede o horário de funcionamento da unidade",
      400,
    );
  }

  const availableSlots: string[] = [];
  const lastPossibleStart = currentEndMinutes - totalDurationMinutes;

  for (
    let minute = currentStartMinutes;
    minute <= lastPossibleStart;
    minute += slotMinutes
  ) {
    const hh = String(Math.floor(minute / 60)).padStart(2, "0");
    const mm = String(minute % 60).padStart(2, "0");

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
