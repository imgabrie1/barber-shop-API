import { AppError } from "../errors";
import {
  APP_TIME_ZONE,
  getZonedDay,
  getZonedMinutes,
  isSameZonedDate,
} from "./timezone";
import { z } from "zod";

const envSchema = z.object({
  BUSINESS_START_MINUTES_ENV: z.coerce.number().default(8),
  BUSINESS_END_MINUTES_ENV: z.coerce.number().default(18),
});

const env = envSchema.parse(process.env);

export const BUSINESS_START_MINUTES = env.BUSINESS_START_MINUTES_ENV * 60;
export const BUSINESS_END_MINUTES = env.BUSINESS_END_MINUTES_ENV * 60;

const isAllowedDay = (day: number) => day >= 1 && day <= 6;

export const ensureWithinBusinessHours = (
  start: Date,
  end: Date,
  shopLimits?: {
    alwaysOpen?: boolean;
    businessStartHour: number;
    businessEndHour: number;
  },
): void => {
  const startDay = getZonedDay(start, APP_TIME_ZONE);
  const endDay = getZonedDay(end, APP_TIME_ZONE);

  if (!isAllowedDay(startDay) || !isAllowedDay(endDay)) {
    throw new AppError("Agendamentos apenas de segunda a sábado", 400);
  }

  if (!isSameZonedDate(start, end, APP_TIME_ZONE)) {
    throw new AppError("Agendamento deve iniciar e terminar no mesmo dia", 400);
  }

  if (shopLimits?.alwaysOpen) return;

  const startMinutes = getZonedMinutes(start, APP_TIME_ZONE);
  const endMinutes = getZonedMinutes(end, APP_TIME_ZONE);

  const limitStart = shopLimits
    ? shopLimits.businessStartHour * 60
    : BUSINESS_START_MINUTES;
  const limitEnd = shopLimits
    ? shopLimits.businessEndHour * 60
    : BUSINESS_END_MINUTES;

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
