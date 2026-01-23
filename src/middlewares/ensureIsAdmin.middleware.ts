import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

const ensureIsAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const authenticatedUser = req

    if(authenticatedUser.role !== "admin"){
        throw new AppError("Permissão insuficiente (nao é admin)", 403)
    }
    console.log("user:", authenticatedUser.id)
    return next()
}

export default ensureIsAdminMiddleware