import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";
import { returnServiceSchema } from "../../schemas/barberServices.schema";

const getBarberServiceByIDService = async (serviceID: string) => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const service = await serviceRepo.findOne({
    where: {
      id: serviceID,
    },
    relations: ["shops"],
  });

  if (!service) {
    throw new AppError("Serviço não encontrado", 404);
  }

  return returnServiceSchema.parse(service);
};

export default getBarberServiceByIDService;
