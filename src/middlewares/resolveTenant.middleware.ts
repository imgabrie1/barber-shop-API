import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entities/tenant.entity";
import { TenantContext } from "../utils/tenantContext";

export const resolveTenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (
    req.path === "/health" ||
    req.path === "/tenant/register" ||
    req.path.startsWith("/platform")
  ) {
    await TenantContext.run(undefined, () => {
      next();
    });
    return;
  }

  const tenantHeader = req.headers["x-tenant-id"] as string;

  if (!tenantHeader) {
    res.status(400).json({ message: "Header X-Tenant-ID é obrigatório" });
    return;
  }

  const tenantRepo = AppDataSource.getRepository(Tenant);
  let tenant: Tenant | null = null;

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    tenantHeader
  );

  await TenantContext.bypass(async () => {
    if (isUuid) {
      tenant = await tenantRepo.findOneBy({ id: tenantHeader, isActive: true });
    } else {
      tenant = await tenantRepo.findOneBy({ slug: tenantHeader, isActive: true });
    }
  });

  if (!tenant) {
    res.status(404).json({ message: "Tenant não encontrado ou inativo" });
    return;
  }

  req.tenantId = (tenant as Tenant).id;
  req.tenant = tenant;

  await TenantContext.run((tenant as Tenant).id, () => {
    next();
  });
};
