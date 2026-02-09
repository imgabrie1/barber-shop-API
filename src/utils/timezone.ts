const APP_TIME_ZONE = "America/Sao_Paulo";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const hasExplicitTimeZone = (value: string): boolean => {
  return /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
};

const getZonedParts = (date: Date, timeZone = APP_TIME_ZONE): ZonedParts => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
};

const getTimeZoneOffsetMinutes = (
  date: Date,
  timeZone = APP_TIME_ZONE,
): number => {
  const parts = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return (asUTC - date.getTime()) / 60000;
};

const toUtcFromLocalParts = (
  parts: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second?: number;
    millisecond?: number;
  },
  timeZone = APP_TIME_ZONE,
): Date => {
  const utcDate = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second ?? 0,
      parts.millisecond ?? 0,
    ),
  );
  const offset = getTimeZoneOffsetMinutes(utcDate, timeZone);
  return new Date(utcDate.getTime() - offset * 60000);
};

const parseLocalDateTime = (
  value: string,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } | null => {
  const dateOnly = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
  const dateTime =
    /^([0-9]{4})-([0-9]{2})-([0-9]{2})[T ]([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?$/;

  const dateOnlyMatch = value.match(dateOnly);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return {
      year: Number(y),
      month: Number(m),
      day: Number(d),
      hour: 0,
      minute: 0,
      second: 0,
    };
  }

  const dateTimeMatch = value.match(dateTime);
  if (!dateTimeMatch) {
    return null;
  }

  const [, y, m, d, hh, mm, ss] = dateTimeMatch;
  return {
    year: Number(y),
    month: Number(m),
    day: Number(d),
    hour: Number(hh),
    minute: Number(mm),
    second: Number(ss ?? "0"),
  };
};

export const toUtcDate = (
  value: string | Date,
  timeZone = APP_TIME_ZONE,
): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (hasExplicitTimeZone(value)) {
    return new Date(value);
  }

  const parsed = parseLocalDateTime(value);
  if (!parsed) {
    return new Date(value);
  }

  return toUtcFromLocalParts(parsed, timeZone);
};

export const getUtcRangeForLocalDate = (
  date: string,
  timeZone = APP_TIME_ZONE,
): { start: Date; end: Date } => {
  const parsed = parseLocalDateTime(date);
  if (!parsed) {
    const fallback = new Date(date);
    const startFallback = new Date(fallback);
    startFallback.setHours(0, 0, 0, 0);
    const endFallback = new Date(fallback);
    endFallback.setHours(23, 59, 59, 999);
    return { start: startFallback, end: endFallback };
  }

  const start = toUtcFromLocalParts(
    { ...parsed, hour: 0, minute: 0, second: 0, millisecond: 0 },
    timeZone,
  );
  const end = toUtcFromLocalParts(
    { ...parsed, hour: 23, minute: 59, second: 59, millisecond: 999 },
    timeZone,
  );

  return { start, end };
};

export const formatTimeInTimeZone = (
  date: Date,
  timeZone = APP_TIME_ZONE,
): string => {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const formatDateTimeInTimeZone = (
  date: Date,
  timeZone = APP_TIME_ZONE,
): string => {
  const parts = getZonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${parts.year}-${pad(parts.month)}-${pad(parts.day)}` +
    `T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`
  );
};

export const getZonedDay = (
  date: Date,
  timeZone = APP_TIME_ZONE,
): number => {
  const parts = getZonedParts(date, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
};

export const getZonedMinutes = (
  date: Date,
  timeZone = APP_TIME_ZONE,
): number => {
  const parts = getZonedParts(date, timeZone);
  return parts.hour * 60 + parts.minute;
};

export const isSameZonedDate = (
  start: Date,
  end: Date,
  timeZone = APP_TIME_ZONE,
): boolean => {
  const a = getZonedParts(start, timeZone);
  const b = getZonedParts(end, timeZone);
  return a.year === b.year && a.month === b.month && a.day === b.day;
};

export { APP_TIME_ZONE };
