import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { iShop } from "../../interfaces/barberServices.interface";
import { returnShopSchema } from "../../schemas/barberServices.schema";


const createShopService = async (shopData: iShop): Promise<any> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  const shop = shopRepo.create(shopData);
  await shopRepo.save(shop);

  return returnShopSchema.parse(shop);
};

export default createShopService;
