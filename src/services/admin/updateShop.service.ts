import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { AppError } from "../../errors";
import { returnShopSchema } from "../../schemas/barberServices.schema";

const updateShopService = async (
  shopId: string,
  shopData: Partial<Shop>
): Promise<any> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  const shop = await shopRepo.findOne({
    where: { id: shopId },
    relations: ["schedules"],
  });

  if (!shop) {
    throw new AppError("Shop não encontrada", 404);
  }

  const updatedShop = shopRepo.create({
    ...shop,
    ...(shopData as any),
  });

  await shopRepo.save(updatedShop);

  return returnShopSchema.parse(updatedShop);
};

export default updateShopService;
