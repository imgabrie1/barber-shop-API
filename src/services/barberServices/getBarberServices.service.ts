import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { returnMultipleServiceSchema } from "../../schemas/barberServices.schema";



const getBarberServicesService = async (shopId: string) => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const services = await serviceRepo.find({
    where: {
      shops: {
        id: shopId
      }
    },
    relations: ["shops"],
  });

  return returnMultipleServiceSchema.parse(services);
};

export default getBarberServicesService;
