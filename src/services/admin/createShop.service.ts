import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { iReturnShops } from "../../interfaces/barberServices.interface";


const createShopService = async (shopData: iReturnShops): Promise<Shop> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  const shop = shopRepo.create(shopData);
  await shopRepo.save(shop);

  return shop;
};

export default createShopService;
