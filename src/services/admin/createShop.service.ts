import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";

interface iShopRequest {
  name: string;
  address?: string;
  businessStartHour?: number;
  businessEndHour?: number;
}

const createShopService = async (shopData: iShopRequest): Promise<Shop> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  const shop = shopRepo.create(shopData);
  await shopRepo.save(shop);

  return shop;
};

export default createShopService;
