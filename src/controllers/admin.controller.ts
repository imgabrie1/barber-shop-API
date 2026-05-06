import { Request, Response } from "express";
import createShopService from "../services/admin/createShop.service";
import getRevenueService from "../services/admin/getRevenue.service";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import roleEnum from "../enum/role.enum";
import { AppError } from "../errors";
import { updateBarberServiceCommissionService } from "../services/barberServices/updateBarberServiceCommission.service";
import updateShopService from "../services/admin/updateShop.service";
import deleteShopService from "../services/admin/deleteShop.service";

export const createShopController = async (req: Request, res: Response) => {
  const shop = await createShopService(req.body);
  return res.status(201).json(shop);
};

export const updateShopController = async (req: Request, res: Response) => {
  const shopId = req.params.id as string;
  const updatedShop = await updateShopService(shopId, req.body);
  return res.status(200).json(updatedShop);
};

export const deleteShopController = async (req: Request, res: Response) => {
  const shopId = req.params.id as string;
  await deleteShopService(shopId);
  return res.status(204).send();
};

export const getRevenueController = async (req: Request, res: Response) => {
  const { filterType, filterValue } = req.query;
  let shopId = req.query.shopId as string;

  if (req.role === roleEnum.MANAGER) {
    const userRepo = AppDataSource.getRepository(User);
    const manager = await userRepo.findOne({
      where: { id: req.id },
      relations: ["shop"],
    });

    shopId = manager?.shop?.id || "";
  }

  const revenue = await getRevenueService({
    filterType: filterType as any,
    filterValue: filterValue as string,
    shopId: shopId,
  });

  return res.json(revenue);
};

export const updateBarberServiceCommissionController = async (
  request: Request,
  response: Response,
): Promise<Response> => {
  try {
    const { barberId, serviceId, commissionPercentage } = request.body;

    const updatedCommission = await updateBarberServiceCommissionService(
      barberId,
      serviceId,
      commissionPercentage,
    );

    return response.status(200).json(updatedCommission);
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
