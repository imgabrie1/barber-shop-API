import { AppDataSource } from "../../data-source";
import { BarberServiceCommission } from "../../entities/barberServiceCommission.entity";
import { User } from "../../entities/user.entity";
import { Service } from "../../entities/services.entity";
import { AppError } from "../../errors";

export const updateBarberServiceCommissionService = async (
  barberId: string,
  serviceId: string,
  commissionPercentage: number,
) => {
  const barberServiceCommissionRepo = AppDataSource.getRepository(BarberServiceCommission);
  const userRepo = AppDataSource.getRepository(User);
  const serviceRepo = AppDataSource.getRepository(Service);

  const barber = await userRepo.findOneBy({ id: barberId });
  if (!barber) {
    throw new AppError("Barbeiro não encontrado", 404);
  }

  const service = await serviceRepo.findOneBy({ id: serviceId });
  if (!service) {
    throw new AppError("Serviço não encontrado", 404);
  }

  let barberServiceCommission = await barberServiceCommissionRepo.findOne({
    where: { barber: { id: barberId }, service: { id: serviceId } },
  });

  if (barberServiceCommission) {
    barberServiceCommission.commissionPercentage = commissionPercentage;
  } else {
    barberServiceCommission = barberServiceCommissionRepo.create({
      barber: barber,
      service: service,
      commissionPercentage: commissionPercentage,
    });
  }

  await barberServiceCommissionRepo.save(barberServiceCommission);

  return barberServiceCommission;
};
