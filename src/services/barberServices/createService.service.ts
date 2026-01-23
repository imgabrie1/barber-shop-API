import { DeepPartial } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";
import {
  iRepoService,
  iService,
  iServiceReturn,
} from "../../interfaces/barberServices.interface";
import { returnServiceSchema } from "../../schemas/barberServices.schema";

const createBarberServiceService = async (
  serviceData: iService,
): Promise<iServiceReturn> => {
  const serviceRepo: iRepoService = AppDataSource.getRepository(Service);

  const existingService = await serviceRepo.findOne({
    where: {
      name: serviceData.name,
    },
  });

  if (existingService) {
    throw new AppError("Esse serviço já existe", 409);
  }

//   const service: Service = serviceRepo.create(serviceData as DeepPartial<Service>);
  const service: Service = serviceRepo.create(serviceData);

  await serviceRepo.save(service);

  const newService = returnServiceSchema.parse(service);

  return newService;
};

export default createBarberServiceService;
