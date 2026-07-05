import { AppError } from "../errors";
import {
  APP_TIME_ZONE,
  getZonedDay,
  getZonedMinutes,
  isSameZonedDate,
} from "./timezone";
import { z } from "zod";



import { ShopSchedule } from "../entities/shopSchedule.entity";

export const ensureWithinBusinessHours = (
  start: Date,
  end: Date,
  shopLimits?: {
    alwaysOpen?: boolean;
    schedules?: ShopSchedule[];
  },
): void => {
  const startDay = getZonedDay(start, APP_TIME_ZONE);
  const endDay = getZonedDay(end, APP_TIME_ZONE);

  if (!isSameZonedDate(start, end, APP_TIME_ZONE)) {
    throw new AppError("Agendamento deve iniciar e terminar no mesmo dia", 400);
  }

  if (shopLimits?.alwaysOpen) return;

  const startMinutes = getZonedMinutes(start, APP_TIME_ZONE);
  const endMinutes = getZonedMinutes(end, APP_TIME_ZONE);

  const schedules = shopLimits?.schedules || [];
  const daySchedule = schedules.find((s) => s.dayOfWeek === startDay);

  if (!daySchedule || !daySchedule.isOpen) {
    throw new AppError("A barbearia não está aberta neste dia", 400);
  }

  const limitStart = daySchedule.startHour * 60;
  const limitEnd = daySchedule.endHour * 60;

  if (startMinutes < limitStart || endMinutes > limitEnd) {
    const formatTime = (min: number) =>
      `${Math.floor(min / 60)
        .toString()
        .padStart(2, "0")}:00`;

    throw new AppError(
      `Agendamentos apenas no horário permitido desta unidade (${formatTime(limitStart)}-${formatTime(limitEnd)} BRT)`,
      400,
    );
  }
};
