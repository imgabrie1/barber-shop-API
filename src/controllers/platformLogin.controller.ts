import { Request, Response } from "express";
import { iLogin } from "../interfaces/login.interface";
import createLoginService from "../services/login/createLogin.service";
import { AppError } from "../errors";

const createPlatformLoginController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const loginData: iLogin = req.body;

  const { token, refreshToken, user } = await createLoginService(loginData);

  if (user.role !== "super_admin") {
    throw new AppError("Acesso negado: apenas administradores da plataforma podem fazer login por aqui", 403);
  }

  const { password, ...userWithoutPassword } = user;

  return res.json({
    user: userWithoutPassword,
    token: token,
    refreshToken: refreshToken,
  });
};

export default createPlatformLoginController;
