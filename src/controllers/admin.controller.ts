import { Request, Response } from "express";
import createShopService from "../services/admin/createShop.service";
import getRevenueService from "../services/admin/getRevenue.service";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import roleEnum from "../enum/role.enum";
import { AppError } from "../errors";
import updateShopService from "../services/admin/updateShop.service";
import deleteShopService from "../services/admin/deleteShop.service";
import cleanupOldRevenueService from "../services/admin/cleanupOldRevenue.service";

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

export const cleanupOldRevenueController = async (req: Request, res: Response) => {
  const result = await cleanupOldRevenueService();
  return res.status(200).json(result);
};
