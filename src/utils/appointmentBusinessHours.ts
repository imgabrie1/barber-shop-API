import { AppError } from "../errors";

const BUSINESS_START_MINUTES = 8 * 60;
const BUSINESS_END_MINUTES = 18 * 60;

const isAllowedDay = (day: number) => day >= 1 && day <= 6;

export const ensureWithinBusinessHours = (start: Date, end: Date): void => {
  const startDay = start.getUTCDay();
  const endDay = end.getUTCDay();

  if (!isAllowedDay(startDay) || !isAllowedDay(endDay)) {
    throw new AppError("Agendamentos apenas de segunda a sábado", 400);
  }

  const sameDate =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();

  if (!sameDate) {
    throw new AppError(
      "Agendamento deve iniciar e terminar no mesmo dia",
      400,
    );
  }

  const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
  const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();

  if (
    startMinutes < BUSINESS_START_MINUTES ||
    endMinutes > BUSINESS_END_MINUTES
  ) {
    throw new AppError(
      "Agendamentos apenas no horário comercial (08:00-18:00 UTC)",
      400,
    );
  }
};
