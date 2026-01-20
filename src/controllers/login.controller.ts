import { Request, Response } from "express";
import { iLogin } from "../interfaces/login.interface";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { AppError } from "../errors";
import createLoginService from "../services/login/createLogin.service";

const createLoginController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const userRepo = AppDataSource.getRepository(User);
  const loginData: iLogin = req.body;

  const user = await userRepo.findOne({
    where: { phoneNumber: loginData.phoneNumber },
  });

  const { token, refreshToken } = await createLoginService(loginData);

  if (user) {
    const { password, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token: token,
      refreshToken: refreshToken,
    });
  } else {
    throw new AppError("Usuário não encontrado", 404);
  }
};

export default createLoginController;
