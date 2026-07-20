import { DeepPartial } from "typeorm";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { Shop } from "../../entities/shop.entity";
import { Tenant } from "../../entities/tenant.entity";
import { AppError } from "../../errors";
import { iUser, iUserReturn } from "../../interfaces/user.interface";
import { returnUserSchemaComplete } from "../../schemas/users.schema";
import roleEnum from "../../enum/role.enum";
import { TenantContext } from "../../utils/tenantContext";

const createUserService = async (userData: iUser): Promise<iUserReturn> => {
  const repoUser = AppDataSource.getRepository(User);
  const shopRepo = AppDataSource.getRepository(Shop);

  const existingUser = await repoUser.findOne({
    where: {
      phoneNumber: userData.phoneNumber,
    },
  });

  if (existingUser) {
    throw new AppError("Número de telefone já cadastrado neste tenant", 409);
  }

  const { shopId, ...userCleanData } = userData;

  let shop = null;
  if (userData.role === roleEnum.BARBER || userData.role === roleEnum.MANAGER) {
    if (!shopId) {
      throw new AppError(
        `Para o cargo ${userData.role}, é obrigatório informar uma loja (shopId)`,
        400,
      );
    }
    shop = await shopRepo.findOneBy({ id: shopId });
    if (!shop) {
      throw new AppError("Loja não encontrada", 404);
    }
  } else if (shopId) {
    shop = await shopRepo.findOneBy({ id: shopId });
    if (!shop) {
      throw new AppError("Loja não encontrada", 404);
    }
  }

  const tenantId = TenantContext.getTenantId();
  const tenant = tenantId ? ({ id: tenantId } as Tenant) : undefined;

  const user = repoUser.create({
    ...userCleanData,
    shop: shop ?? undefined,
    tenant,
  } as DeepPartial<User>);

  await repoUser.save(user);

  return returnUserSchemaComplete.parse(user);
};

export default createUserService;
