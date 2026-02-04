import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";
import { iServiceUpdate } from "../../interfaces/barberServices.interface";
import { returnServiceSchema } from "../../schemas/barberServices.schema";

const patchServiceService = async (
  updatedData: Partial<Service>,
  serviceID: string,
): Promise<iServiceUpdate> => {
  const serviceRepo = AppDataSource.getRepository(Service);

  const oldService = await serviceRepo.findOne({
    where: { id: serviceID },
  });

  if (!oldService) {
    throw new AppError("Serviço não encontrado", 404);
  }

  const updatedService = serviceRepo.create({
    ...oldService,
    ...updatedData,
  });

  await serviceRepo.save(updatedService);

  return returnServiceSchema.parse(updatedService);
};

export default patchServiceService;
