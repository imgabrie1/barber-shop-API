import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import { TenantContext } from "../../utils/tenantContext";

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
  const user = await TenantContext.bypass(() =>
    repoUser.findOne({
      where: { id: userId },
      relations: ["tenant"],
    })
  );

  if (!user) {
    throw new AppError("Usuário não encontrado", 401);
  }

  const newToken = jwt.sign(
    {
      role: user.role,
      tenantId: user.tenant ? user.tenant.id : null,
    },
    process.env.SECRET_KEY!,
    {
      expiresIn: "24h", // mudar 15m depois em prod
      subject: String(user.id),
    },
  );

  const newRefreshToken = jwt.sign(
    {
      role: user.role,
      tenantId: user.tenant ? user.tenant.id : null,
    },
    process.env.SECRET_KEY!,
    {
      expiresIn: "7d", // mudar pra 7d em prod
      subject: String(user.id),
    },
  );

  await TenantContext.bypass(() =>
    repoUser.update(user.id, { refreshToken: newRefreshToken })
  );

  return { token: newToken, refreshToken: newRefreshToken };
};

export default refreshTokenService;
