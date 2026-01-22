import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

const ensureIsAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const authenticatedUser = req

    if(authenticatedUser.role !== "barber"){
        throw new AppError("Permissão insuficiente", 403)
    }
    console.log("user:", authenticatedUser.id)
    return next()
}

export default ensureIsAdminMiddleware