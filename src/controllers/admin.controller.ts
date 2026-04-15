import { Request, Response } from "express";
import getRevenueService from "../services/admin/getRevenue.service";
import { AppError } from "../errors";

export const getRevenueController = async (
  request: Request,
  response: Response,
): Promise<Response> => {
  const totalRevenue = await getRevenueService();
  return response.status(200).json({ totalRevenue });
};
