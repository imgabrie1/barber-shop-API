import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import roleEnum from "../enum/role.enum";

export const ensureBelongsToTenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.role === roleEnum.SUPER_ADMIN) {
    return next();
  }

  if (!req.tenantId || req.tenantId !== req.userTenantId) {
    throw new AppError("Acesso não autorizado para este tenant", 403);
  }

  return next();
};
