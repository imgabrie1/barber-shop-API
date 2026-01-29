import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";

const getUserByIDservice = async (userID: string): Promise<User | null> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: {
      id: userID,
    },
  });
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return user;
};
export default getUserByIDservice;
