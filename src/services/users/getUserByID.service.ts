import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import { iUserReturn } from "../../interfaces/user.interface";
import { returnUserSchemaComplete } from "../../schemas/users.schema";

const getUserByIDservice = async (userID: string): Promise<iUserReturn> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: {
      id: userID,
    },
  });
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return returnUserSchemaComplete.parse(user);
};
export default getUserByIDservice;
