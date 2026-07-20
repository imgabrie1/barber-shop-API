import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import { iLogin } from "../../interfaces/login.interface";
import { TenantContext } from "../../utils/tenantContext";
import roleEnum from "../../enum/role.enum";

const createLoginService = async (
  loginData: iLogin,
): Promise<{ token: string; refreshToken: string; user: User }> => {
  const repoUser = AppDataSource.getRepository(User);

  let user = await TenantContext.bypass(() =>
    repoUser.findOne({
      where: {
        phoneNumber: loginData.phoneNumber,
        role: roleEnum.SUPER_ADMIN,
      },
      relations: ["tenant"],
    })
  );

  if (!user) {
    user = await repoUser.findOne({
      where: {
        phoneNumber: loginData.phoneNumber,
      },
      relations: ["tenant"],
    });
  }

  if (!user) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const passwordMatch = await compare(loginData.password, user.password);
  if (!passwordMatch) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const token = jwt.sign(
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

  const refreshToken = jwt.sign(
    {
      role: user.role,
      tenantId: user.tenant ? user.tenant.id : null,
    },
    process.env.SECRET_KEY!,
    {
      expiresIn: "7d",
      subject: String(user.id),
    },
  );

  await TenantContext.bypass(() =>
    repoUser.update(user.id, { refreshToken: refreshToken })
  );

  return { token, refreshToken, user };
};

export default createLoginService;
