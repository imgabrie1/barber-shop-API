import { AppDataSource } from "../../data-source";
import { AppointmentRevenue } from "../../entities/appointmentRevenue.entity";
import { getUtcRangeForLocalDate, APP_TIME_ZONE } from "../../utils/timezone";

interface RevenueResult {
  totalRevenue: number;
  filteredRevenue: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const validateFilterInput = (
  filterType: string,
  filterValue: string,
): ValidationResult => {
  if (!filterValue) {
    return {
      isValid: false,
      error: "filterValue é obrigatório quando filterType é fornecido",
    };
  }

  if (filterType === "day") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(filterValue)) {
      return {
        isValid: false,
        error: "Formato de dia inválido. Use: YYYY-MM-DD",
      };
    }
  } else if (filterType === "month") {
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(filterValue)) {
      return { isValid: false, error: "Formato de mês inválido. Use: YYYY-MM" };
    }
    const [, month] = filterValue.split("-").map(Number);
    if (month < 1 || month > 12) {
      return { isValid: false, error: "Mês deve estar entre 01 e 12" };
    }
  } else if (filterType === "quarter") {
    const quarterRegex = /^\d{4}-Q[1-4]$/;
    if (!quarterRegex.test(filterValue)) {
      return {
        isValid: false,
        error:
          "Formato de trimestre inválido. Use: YYYY-Q1, YYYY-Q2, YYYY-Q3 ou YYYY-Q4",
      };
    }
  } else {
    return {
      isValid: false,
      error: "filterType deve ser: day, month ou quarter",
    };
  }

  return { isValid: true };
};

const getUtcRangeForMonth = (
  filterValue: string,
  timeZone = APP_TIME_ZONE,
): { start: Date; end: Date } => {
  const [yearStr, monthStr] = filterValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const startOfMonthLocal = `${year}-${String(month).padStart(2, "0")}-01`;
  const start = getUtcRangeForLocalDate(startOfMonthLocal, timeZone).start;

  const endOfMonthLocal = new Date(year, month, 0).toISOString().split("T")[0];
  const end = getUtcRangeForLocalDate(endOfMonthLocal, timeZone).end;

  return { start, end };
};

const getUtcRangeForQuarter = (
  filterValue: string,
  timeZone = APP_TIME_ZONE,
): { start: Date; end: Date } => {
  const [yearStr, quarterStr] = filterValue.split("-Q");
  const year = Number(yearStr);
  const quarter = Number(quarterStr);

  const firstMonthOfQuarter = (quarter - 1) * 3 + 1;
  const startOfMonthLocal = `${year}-${String(firstMonthOfQuarter).padStart(
    2,
    "0",
  )}-01`;
  const start = getUtcRangeForLocalDate(startOfMonthLocal, timeZone).start;

  const lastMonthOfQuarter = quarter * 3;
  const endOfMonthLocal = new Date(year, lastMonthOfQuarter, 0)
    .toISOString()
    .split("T")[0];
  const end = getUtcRangeForLocalDate(endOfMonthLocal, timeZone).end;

  return { start, end };
};

const getRevenueService = async (
  filterType?: "day" | "month" | "quarter",
  filterValue?: string,
): Promise<RevenueResult> => {
  const appointmentRevenueRepo =
    AppDataSource.getRepository(AppointmentRevenue);

  if (filterType) {
    const validation = validateFilterInput(filterType, filterValue || "");
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
  }

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (filterType && filterValue) {
    if (filterType === "day") {
      const { start, end } = getUtcRangeForLocalDate(filterValue, APP_TIME_ZONE);
      startDate = start;
      endDate = end;
    } else if (filterType === "month") {
      const { start, end } = getUtcRangeForMonth(filterValue, APP_TIME_ZONE);
      startDate = start;
      endDate = end;
    } else if (filterType === "quarter") {
      const { start, end } = getUtcRangeForQuarter(filterValue, APP_TIME_ZONE);
      startDate = start;
      endDate = end;
    }
  }

  const totalRevenueResult = await appointmentRevenueRepo
    .createQueryBuilder("revenue")
    .select("SUM(revenue.totalServiceRevenue)", "total")
    .getRawOne();

  const totalRevenue = totalRevenueResult?.total
    ? Number(totalRevenueResult.total)
    : 0;

  let filteredRevenue = 0;
  if (startDate && endDate) {
    const result = await appointmentRevenueRepo
      .createQueryBuilder("revenue")
      .select("SUM(revenue.totalServiceRevenue)", "total")
      .where("revenue.recordedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getRawOne();

    filteredRevenue = result?.total ? Number(result.total) : 0;
  } else {
    filteredRevenue = totalRevenue;
  }

  return { totalRevenue, filteredRevenue };
};

export default getRevenueService;
