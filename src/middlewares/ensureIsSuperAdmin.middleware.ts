import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import roleEnum from "../enum/role.enum";

const ensureIsSuperAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== roleEnum.SUPER_ADMIN) {
    throw new AppError("Permissão insuficiente (não é super admin)", 403);
  }
  return next();
};

export default ensureIsSuperAdminMiddleware;
