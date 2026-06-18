import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { iShop } from "../../interfaces/barberServices.interface";
import { returnShopSchema } from "../../schemas/barberServices.schema";


const createShopService = async (shopData: iShop): Promise<any> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  const shop = shopRepo.create({
    ...shopData,
    businessStartHour: shopData.businessStartHour ?? 8,
    businessEndHour: shopData.businessEndHour ?? 18,
  });
  await shopRepo.save(shop);

  return returnShopSchema.parse(shop);
};

export default createShopService;
