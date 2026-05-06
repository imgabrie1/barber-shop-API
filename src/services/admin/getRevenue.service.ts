import { AppDataSource } from "../../data-source";
import { AppointmentRevenue } from "../../entities/appointmentRevenue.entity";
import { Shop } from "../../entities/shop.entity";
import { getUtcRangeForLocalDate, APP_TIME_ZONE } from "../../utils/timezone";

interface ShopRevenue {
  id: string;
  name: string;
  totalRevenue: number;
  filteredRevenue: number;
}

interface RevenueResponse {
  global: {
    totalRevenue: number;
    filteredRevenue: number;
  };
  shops: ShopRevenue[];
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

const getRevenueService = async (queryParams: {
  filterType?: "day" | "month" | "quarter";
  filterValue?: string;
  shopId?: string;
}): Promise<RevenueResponse> => {
  const { filterType, filterValue, shopId } = queryParams;
  const appointmentRevenueRepo =
    AppDataSource.getRepository(AppointmentRevenue);
  const shopRepo = AppDataSource.getRepository(Shop);

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
      const { start, end } = getUtcRangeForLocalDate(
        filterValue,
        APP_TIME_ZONE,
      );
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

  const shops = await shopRepo.find();
  const shopMap = new Map<string, ShopRevenue>();

  shops.forEach((s) => {
    shopMap.set(s.id, {
      id: s.id,
      name: s.name,
      totalRevenue: 0,
      filteredRevenue: 0,
    });
  });

  const totalByShopQuery = appointmentRevenueRepo
    .createQueryBuilder("revenue")
    .select("revenue.shop_id", "shopId")
    .addSelect(
      "SUM(revenue.totalServiceRevenuePaidByClient - revenue.barberCommissionAmount)",
      "total",
    )
    .groupBy("revenue.shop_id");

  if (shopId) {
    totalByShopQuery.where("revenue.shop_id = :shopId", { shopId });
  }

  const totalByShopResults = await totalByShopQuery.getRawMany();

  totalByShopResults.forEach((res) => {
    if (shopMap.has(res.shopId)) {
      shopMap.get(res.shopId)!.totalRevenue = Number(res.total);
    }
  });

  if (startDate && endDate) {
    const filteredQuery = appointmentRevenueRepo
      .createQueryBuilder("revenue")
      .select("revenue.shop_id", "shopId")
      .addSelect(
        "SUM(revenue.totalServiceRevenuePaidByClient - revenue.barberCommissionAmount)",
        "total",
      )
      .where("revenue.recordedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("revenue.shop_id");

    if (shopId) {
      filteredQuery.andWhere("revenue.shop_id = :shopId", { shopId });
    }

    const filteredByShopResults = await filteredQuery.getRawMany();

    filteredByShopResults.forEach((res) => {
      if (shopMap.has(res.shopId)) {
        shopMap.get(res.shopId)!.filteredRevenue = Number(res.total);
      }
    });
  } else {
    shopMap.forEach((s) => (s.filteredRevenue = s.totalRevenue));
  }

  const shopList = Array.from(shopMap.values()).filter((s) => {
    if (shopId) return s.id === shopId;
    return true;
  });

  const globalTotal = shopList.reduce((acc, s) => acc + s.totalRevenue, 0);
  const globalFiltered = shopList.reduce(
    (acc, s) => acc + s.filteredRevenue,
    0,
  );

  return {
    global: {
      totalRevenue: globalTotal,
      filteredRevenue: globalFiltered,
    },
    shops: shopList,
  };
};

export default getRevenueService;
