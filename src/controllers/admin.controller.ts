import { Request, Response } from "express";
import getRevenueService from "../services/admin/getRevenue.service";
import { AppError } from "../errors";

export const getRevenueController = async (
  request: Request,
  response: Response,
): Promise<Response> => {
  const { filterType, filterValue } = request.query;

  const revenue = await getRevenueService(
    filterType as "day" | "month" | "quarter",
    filterValue as string
  );

  return response.status(200).json(revenue);
};
