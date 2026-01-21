import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import { iUserReturn } from "../../interfaces/user.interface";
import { returnUserSchema } from "../../schemas/users.schema";

const patchUserService = async (
  updatedData: Partial<User>,
  userID: string
): Promise<iUserReturn> => {
  const userRepo = AppDataSource.getRepository(User);

  const oldUser = await userRepo.findOne({ where: { id: userID } });

  if (!oldUser) {
    throw new AppError("Usuário não encontrado", 404);
  }

  const updatedUser = userRepo.create({
    ...oldUser,
    ...updatedData,
  });

  await userRepo.save(updatedUser);

  return returnUserSchema.parse(updatedUser);
};

export default patchUserService;
