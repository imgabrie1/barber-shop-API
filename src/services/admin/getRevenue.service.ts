import { AppDataSource } from "../../data-source";
import { AppointmentRevenue } from "../../entities/appointmentRevenue.entity";

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

const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfMonth = (date: Date): Date => {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfMonth = (date: Date): Date => {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfQuarter = (date: Date): Date => {
  const start = new Date(date);
  const month = start.getMonth();
  const quarterMonth = month - (month % 3);
  start.setMonth(quarterMonth, 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfQuarter = (date: Date): Date => {
  const end = new Date(date);
  const month = end.getMonth();
  const quarterMonth = month - (month % 3);
  end.setMonth(quarterMonth + 3, 0);
  end.setHours(23, 59, 59, 999);
  return end;
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
    let baseDate: Date | undefined;


    if (filterType === "day") {
      const [year, month, day] = filterValue.split("-").map(Number);
      baseDate = new Date(year, month - 1, day);

      if (!isNaN(baseDate.getTime())) {
        startDate = getStartOfDay(baseDate);
        endDate = getEndOfDay(baseDate);
      }
    } else if (filterType === "month") {
      const [year, month] = filterValue.split("-").map(Number);
      baseDate = new Date(year, month - 1, 1);

      if (!isNaN(baseDate.getTime())) {
        startDate = getStartOfMonth(baseDate);
        endDate = getEndOfMonth(baseDate);
      }
    } else if (filterType === "quarter") {
      const [yearStr, quarterStr] = filterValue.split("-Q");
      const year = Number(yearStr);
      const quarter = Number(quarterStr);

      baseDate = new Date(year, (quarter - 1) * 3, 1);

      if (!isNaN(baseDate.getTime())) {
        startDate = getStartOfQuarter(baseDate);
        endDate = getEndOfQuarter(baseDate);
      }
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
