import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { Shop } from "../../entities/shop.entity";
import { AppError } from "../../errors";
import {
  iRepoService,
  iService,
  iServiceReturn,
} from "../../interfaces/barberServices.interface";
import { returnServiceSchema } from "../../schemas/barberServices.schema";

const createBarberServiceService = async (
  serviceData: iService,
): Promise<iServiceReturn> => {
  const serviceRepo: iRepoService = AppDataSource.getRepository(Service);
  const shopRepo = AppDataSource.getRepository(Shop);

  const existingService = await serviceRepo.findOne({
    where: {
      name: serviceData.name,
    },
  });

  if (existingService) {
    throw new AppError("Esse serviço já existe", 409);
  }

  const { shopId, ...serviceCleanData } = serviceData;

  let shops: Shop[] = [];

  if (shopId) {
    const shopIds = Array.isArray(shopId) ? shopId : [shopId];
    shops = await shopRepo.findBy({ id: In(shopIds) });

    if (shops.length !== shopIds.length) {
      throw new AppError("Uma ou mais lojas não foram encontradas", 404);
    }
  } else {
    shops = await shopRepo.find();
    if (shops.length === 0) {
      throw new AppError(
        "Nenhuma loja cadastrada para associar o serviço",
        400,
      );
    }
  }

  const service = serviceRepo.create({
    ...serviceCleanData,
    shops: shops,
  });

  await serviceRepo.save(service);

  return returnServiceSchema.parse(service);
};

export default createBarberServiceService;
