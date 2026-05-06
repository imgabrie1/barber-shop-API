import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import roleEnum from "../../enum/role.enum";
import { iUserReturn } from "../../interfaces/user.interface";
import { returnMultipleUserSchema } from "../../schemas/users.schema";

const getBarbersService = async (): Promise<iUserReturn[]> => {
  const userRepo = AppDataSource.getRepository(User);
  const barbers = await userRepo.find({
    where: {
      role: roleEnum.BARBER,
    },
    relations: {
      shop: true,
    },
  });
  return returnMultipleUserSchema.parse(barbers);
};

export default getBarbersService;
