import { Request, Response } from "express";
import { getBarberCommissionRevenueService } from "../services/barber/getBarberCommissionRevenue.service";
import { AppError } from "../errors";

export const getBarberCommissionRevenueController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.id;
  const { filterType, filterValue } = req.query;

  if (!userId) {
    throw new AppError("User ID not found in token.", 401);
  }

  const revenue = await getBarberCommissionRevenueService(
    userId,
    filterType as "day" | "month" | "quarter" | undefined,
    filterValue as string | undefined,
  );
  return res.json(revenue);
};
