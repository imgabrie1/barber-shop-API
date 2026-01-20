import { Request, Response } from "express";
import refreshTokenService from "../services/login/refreshToken.service";
import { AppError } from "../errors";

const refreshTokenController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError("Refresh token é obrigatório", 400);
  }

  const tokens = await refreshTokenService(refresh_token);

  return res.json({
    token: tokens.token,
    refresh_token: tokens.refreshToken,
  });
};

export default refreshTokenController;