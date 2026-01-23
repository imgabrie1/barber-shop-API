import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";

const deleteBarberServiceService = async (serviceID: string): Promise<void> => {
  const serviceRepo = AppDataSource.getRepository(Service);

  const service = await serviceRepo.findOne({
    where: { id: serviceID },
  });

  if (!service) {
    throw new AppError("Serviço não encontrado", 404);
  }

  await serviceRepo.delete(service.id);
  return;
};

export default deleteBarberServiceService;
