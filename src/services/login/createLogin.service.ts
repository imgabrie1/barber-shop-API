import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import { iLogin } from "../../interfaces/login.interface";

const createLoginService = async (
  loginData: iLogin,
): Promise<{ token: string; refreshToken: string }> => {
  const repoUser = AppDataSource.getRepository(User);

  const user = await repoUser.findOneBy({
    phoneNumber: loginData.phoneNumber,
  });

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
    },
    process.env.SECRET_KEY!,
    {
      expiresIn: "15m",
      subject: String(user.id),
    },
  );

  const refreshToken = jwt.sign(
    {
      role: user.role,
    },
    process.env.SECRET_KEY!,
    {
      expiresIn: "7d",
      subject: String(user.id),
    },
  );

  await repoUser.update(user.id, { refreshToken: refreshToken });

  return { token, refreshToken };
};

export default createLoginService;
