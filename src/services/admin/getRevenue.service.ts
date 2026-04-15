import { AppDataSource } from "../../data-source";
import { AppointmentRevenue } from "../../entities/appointmentRevenue.entity";
import { Between } from "typeorm";

interface RevenueResult {
  totalRevenue: number;
  filteredRevenue: number;
}

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
  filterValue?: string
): Promise<RevenueResult> => {
  const appointmentRevenueRepo = AppDataSource.getRepository(AppointmentRevenue);

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (filterType && filterValue) {
    let baseDate: Date | undefined;

    if (filterType === "day") {
      baseDate = new Date(filterValue);
      if (!isNaN(baseDate.getTime())) {
        startDate = getStartOfDay(baseDate);
        endDate = getEndOfDay(baseDate);
      }
    } else if (filterType === "month") {
      const [year, month] = filterValue.split('-').map(Number);
      if (year && month) {
        baseDate = new Date(year, month - 1);
        if (!isNaN(baseDate.getTime())) {
          startDate = getStartOfMonth(baseDate);
          endDate = getEndOfMonth(baseDate);
        }
      }
    } else if (filterType === "quarter") {
      const [yearStr, quarterStr] = filterValue.split('-Q');
      const year = Number(yearStr);
      const quarter = Number(quarterStr);
      if (year && quarter) {
        baseDate = new Date(year, (quarter - 1) * 3);
        if (!isNaN(baseDate.getTime())) {
          startDate = getStartOfQuarter(baseDate);
          endDate = getEndOfQuarter(baseDate);
        }
      }
    }
  }

  const totalRevenue = await appointmentRevenueRepo.sum('totalServiceRevenue');

  let filteredRevenue = 0;
  if (startDate && endDate) {
    const revenuesForFilter = await appointmentRevenueRepo.find({
      where: {
        recordedAt: Between(startDate, endDate),
      },
    });
    filteredRevenue = revenuesForFilter.reduce((sum, record) => sum + Number(record.totalServiceRevenue), 0);
  } else {
    filteredRevenue = totalRevenue || 0;
  }

  return { totalRevenue: totalRevenue || 0, filteredRevenue };
};

export default getRevenueService;
