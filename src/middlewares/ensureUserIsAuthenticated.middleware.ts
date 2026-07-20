import { Request, Response, NextFunction } from "express"
import { AppError } from "../errors"
import jwt from "jsonwebtoken"
import "dotenv/config"
import roleEnum from "../enum/role.enum"

const ensureUserIsAuthenticatedMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {

    let token = req.headers.authorization

    if(!token){
        throw new AppError("Token não encontrado", 401)
    }

    token = token.split(" ")[1]

    jwt.verify(token!, process.env.SECRET_KEY!, (error, decoded: any) => {
        if(error){
            throw new AppError(error.message, 401)
        }

        req.id = decoded.sub
        req.role = decoded.role
        req.user = decoded.user
        req.userTenantId = decoded.tenantId

        if (req.role !== roleEnum.SUPER_ADMIN) {
            if (!req.tenantId || req.tenantId !== req.userTenantId) {
                throw new AppError("Acesso não autorizado para este tenant", 403)
            }
        }

        return next()
    })

}

export default ensureUserIsAuthenticatedMiddleware