import { AppError } from "../errors";
import {
  APP_TIME_ZONE,
  getZonedDay,
  getZonedMinutes,
  isSameZonedDate,
} from "./timezone";

export const BUSINESS_START_MINUTES = 8 * 60;
export const BUSINESS_END_MINUTES = 18 * 60;

const isAllowedDay = (day: number) => day >= 1 && day <= 6;

export const ensureWithinBusinessHours = (start: Date, end: Date): void => {
  const startDay = getZonedDay(start, APP_TIME_ZONE);
  const endDay = getZonedDay(end, APP_TIME_ZONE);

  if (!isAllowedDay(startDay) || !isAllowedDay(endDay)) {
    throw new AppError("Agendamentos apenas de segunda a sábado", 400);
  }

  if (!isSameZonedDate(start, end, APP_TIME_ZONE)) {
    throw new AppError(
      "Agendamento deve iniciar e terminar no mesmo dia",
      400,
    );
  }

  const startMinutes = getZonedMinutes(start, APP_TIME_ZONE);
  const endMinutes = getZonedMinutes(end, APP_TIME_ZONE);

  if (
    startMinutes < BUSINESS_START_MINUTES ||
    endMinutes > BUSINESS_END_MINUTES
  ) {
    throw new AppError(
      "Agendamentos apenas no horário comercial (08:00-18:00 BRT)",
      400,
    );
  }
};
