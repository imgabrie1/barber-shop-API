import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/services.entity";
import { returnMultipleServiceSchema } from "../../schemas/barberServices.schema";
import { IPaginationParams } from "../../interfaces/params.interface";
import z from "zod";

interface IGetBarberServicesParams extends IPaginationParams {
  shopId: string;
}

const getBarberServicesService = async ({
  shopId,
  page = 1,
  limit = 10,
}: IGetBarberServicesParams): Promise<{
  data: z.infer<typeof returnMultipleServiceSchema>;
  total: number;
  page: number;
  limit: number;
}> => {
  const serviceRepo = AppDataSource.getRepository(Service);
  const [services, total] = await serviceRepo.findAndCount({
    where: {
      shops: {
        id: shopId,
      },
    },
    relations: ["shops"],
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: returnMultipleServiceSchema.parse(services),
    total,
    page,
    limit,
  };
};

export default getBarberServicesService;
