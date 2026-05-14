import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { iUserReturn } from "../../interfaces/user.interface";
import { returnMultipleUserSchema } from "../../schemas/users.schema";
import { IPaginationParams } from "../../interfaces/params.interface";

const getUsersService = async ({
  page = 1,
  limit = 10,
}: IPaginationParams): Promise<{
  data: iUserReturn[];
  total: number;
  page: number;
  limit: number;
}> => {
  const userRepo = AppDataSource.getRepository(User);
  const [users, total] = await userRepo.findAndCount({
    relations: {
      shop: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: returnMultipleUserSchema.parse(users),
    total,
    page,
    limit,
  };
};

export default getUsersService;
