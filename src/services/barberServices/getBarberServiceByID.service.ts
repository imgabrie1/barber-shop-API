import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";

const getBarberServiceByIDService = async (
  serviceID: string,
): Promise<Service | null> => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const service = await serviceRepo.findOne({
    where: {
      id: serviceID,
    },
  });
  if (!service) {
    throw new AppError("Serviço não encontrado", 404);
  }
  return service;
};

export default getBarberServiceByIDService;
