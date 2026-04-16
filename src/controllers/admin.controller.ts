import { Request, Response } from "express";
import getRevenueService from "../services/admin/getRevenue.service";
import { AppError } from "../errors";

export const getRevenueController = async (
  request: Request,
  response: Response,
): Promise<Response> => {
  try {
    const { filterType, filterValue } = request.query;

    if (filterType && !filterValue) {
      throw new AppError(
        "filterValue é obrigatório quando filterType é fornecido",
        400,
      );
    }

    if (
      filterType &&
      !["day", "month", "quarter"].includes(filterType as string)
    ) {
      throw new AppError(
        "filterType inválido. Use: day, month ou quarter",
        400,
      );
    }

    const revenue = await getRevenueService(
      filterType as "day" | "month" | "quarter" | undefined,
      filterValue as string | undefined,
    );

    return response.status(200).json(revenue);
  } catch (error) {
    if (error instanceof AppError) {
      return response.status(error.statusCode).json({ error: error.message });
    }

    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    }

    return response.status(500).json({ error: "Erro interno do servidor" });
  }
};
