import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { AppError } from "../../errors";

const deleteShopService = async (shopId: string): Promise<void> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  const shop = await shopRepo.findOneBy({ id: shopId });

  if (!shop) {
    throw new AppError("Shop não encontrada", 404);
  }

  await shopRepo.delete(shop.id);
  return;
};

export default deleteShopService;
