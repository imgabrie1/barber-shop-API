import { AppDataSource } from "../../data-source";
import { Shop } from "../../entities/shop.entity";
import { iShop } from "../../interfaces/barberServices.interface";
import { returnShopSchema } from "../../schemas/barberServices.schema";


const createShopService = async (shopData: iShop): Promise<any> => {
  const shopRepo = AppDataSource.getRepository(Shop);

  let schedules = shopData.schedules;

  if (!schedules || schedules.length === 0) {
    schedules = [];
    for (let i = 0; i <= 6; i++) {
      schedules.push({
        dayOfWeek: i,
        startHour: 8,
        endHour: 18,
        isOpen: i >= 1 && i <= 6, // segunda a sabado
      });
    }
  }

  const shop = shopRepo.create({
    ...shopData,
    schedules: schedules as any,
  });
  await shopRepo.save(shop);

  return returnShopSchema.parse(shop);
};

export default createShopService;
