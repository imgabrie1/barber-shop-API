import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import roleEnum from "../enum/role.enum";

const ensureIsAdminOrManagerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.role;

  if (role !== roleEnum.ADMIN && role !== roleEnum.MANAGER) {
    throw new AppError("Permissão insuficiente (apenas Admin ou Gerente)", 403);
  }

  return next();
};

export default ensureIsAdminOrManagerMiddleware;
