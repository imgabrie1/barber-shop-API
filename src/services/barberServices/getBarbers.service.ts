import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import roleEnum from "../../enum/role.enum";

const getBarbersService = async (): Promise<User[]> => {
    const userRepo = AppDataSource.getRepository(User);
    const barbers = await userRepo.find({
        where: {
            role: roleEnum.BARBER,
        }
    });
    return barbers;
};

export default getBarbersService;
