import { Request, Response } from "express";
import createTenantService from "../services/tenant/createTenant.service";
import getTenantsService from "../services/tenant/getTenants.service";
import toggleTenantStatusService from "../services/tenant/toggleTenantStatus.service";
import getTenantStatsService from "../services/tenant/getTenantStats.service";
import { registerTenantSchema } from "../schemas/tenant.schema";

export const registerTenantController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const validatedData = registerTenantSchema.parse(req.body);
  const result = await createTenantService(validatedData);
  return res.status(201).json(result);
};

export const getTenantsController = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const tenants = await getTenantsService();
  return res.status(200).json(tenants);
};

export const toggleTenantStatusController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as string;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "O campo 'isActive' deve ser boolean" });
  }

  const tenant = await toggleTenantStatusService({ id, isActive });
  return res.status(200).json(tenant);
};

export const getTenantStatsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as string;
  const stats = await getTenantStatsService(id);
  return res.status(200).json(stats);
};
