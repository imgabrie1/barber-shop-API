import { AppDataSource } from "../../data-source";
import { AppointmentRevenue } from "../../entities/appointmentRevenue.entity";
import { LessThan } from "typeorm";


const cleanupOldRevenueService = async (): Promise<{ deletedCount: number }> => {
  const appointmentRevenueRepo = AppDataSource.getRepository(AppointmentRevenue);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const result = await appointmentRevenueRepo.delete({
    recordedAt: LessThan(threeMonthsAgo),
  });

  return {
    deletedCount: result.affected || 0,
  };
};

export default cleanupOldRevenueService;
