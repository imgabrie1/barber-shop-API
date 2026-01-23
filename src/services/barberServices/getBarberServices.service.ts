import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";

const getBarberServicesService = async (): Promise<Service[]> => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const services = await serviceRepo.find();
  return services;
};

export default getBarberServicesService;
