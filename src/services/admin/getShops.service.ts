import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { returnMultipleShopSchema } from "../../schemas/barberServices.schema";

const getShopsService = async () => {
  const shopRepo = AppDataSource.getRepository(Shop);
  const shops = await shopRepo.find();

  return returnMultipleShopSchema.parse(shops);
};

export default getShopsService;
