import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { iUserReturn } from "../../interfaces/user.interface";
import { returnMultipleUserSchema } from "../../schemas/users.schema";

const getUsersService = async (): Promise<iUserReturn[]> => {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    return returnMultipleUserSchema.parse(users);
};

export default getUsersService;
