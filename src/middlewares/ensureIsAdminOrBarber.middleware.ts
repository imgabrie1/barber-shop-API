import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

const ensureIsAdminOrBarberMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const authenticatedUser = req

    if(authenticatedUser.role === "client"){
        throw new AppError("Permissão insuficiente (nao é admin nem barber)", 403)
    }
    console.log("user:", authenticatedUser.id)
    return next()
}

export default ensureIsAdminOrBarberMiddleware