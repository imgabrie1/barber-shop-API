import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { returnMultipleServiceSchema } from "../../schemas/barberServices.schema";

const getBarberServicesService = async () => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const services = await serviceRepo.find({
    relations: ["shops"],
  });

  return returnMultipleServiceSchema.parse(services);
};

export default getBarberServicesService;
