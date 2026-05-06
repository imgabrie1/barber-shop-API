import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { Shop } from "../../entities/shop.entity";
import { AppError } from "../../errors";
import { returnServiceSchema } from "../../schemas/barberServices.schema";

const patchServiceService = async (
  updatedData: any,
  serviceID: string,
): Promise<any> => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const shopRepo = AppDataSource.getRepository(Shop);

  const oldService = await serviceRepo.findOne({
    where: { id: serviceID },
    relations: ["shops"],
  });

  if (!oldService) {
    throw new AppError("Serviço não encontrado", 404);
  }

  const { shopId, ...serviceCleanData } = updatedData;

  let shops = oldService.shops;

  if (shopId) {
    const shopIds = Array.isArray(shopId) ? shopId : [shopId];
    shops = await shopRepo.findBy({ id: In(shopIds) });

    if (shops.length !== shopIds.length) {
      throw new AppError("Uma ou mais lojas não foram encontradas", 404);
    }
  }

  const updatedService = serviceRepo.create({
    ...oldService,
    ...serviceCleanData,
    shops: shops,
  });

  await serviceRepo.save(updatedService);

  return returnServiceSchema.parse(updatedService);
};

export default patchServiceService;
