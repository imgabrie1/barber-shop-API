import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";

const refreshTokenService = async (
  refreshTokenRequest: string,
): Promise<{ token: string; refreshToken: string }> => {
  const repoUser = AppDataSource.getRepository(User);

  let decoded: any;
  try {
    decoded = jwt.verify(refreshTokenRequest, process.env.SECRET_KEY!);
  } catch (error) {
    throw new AppError("Refresh token inválido ou expirado", 401);
  }

  const userId = decoded.sub;
  const user = await repoUser.findOneBy({ id: userId });

  if (!user) {
    throw new AppError("Usuário não encontrado", 401);
  }

  if (user.refreshToken !== refreshTokenRequest) {
    throw new AppError("Refresh token inválido", 401);
  }

  const newToken = jwt.sign(
    { role: user.role === "admin" },
    process.env.SECRET_KEY!,
    {
      expiresIn: "24h", // mudar 15m depois em prod
      subject: String(user.id),
    },
  );

  const newRefreshToken = jwt.sign(
    { role: user.role === "admin" },
    process.env.SECRET_KEY!,
    {
      expiresIn: "7d", // mudar pra 7d em prod
      subject: String(user.id),
    },
  );

  await repoUser.update(user.id, { refreshToken: newRefreshToken });

  return { token: newToken, refreshToken: newRefreshToken };
};

export default refreshTokenService;
