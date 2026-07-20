import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user.entity";
import { Appointment } from "../../entities/appointments.entity";
import { AppError } from "../../errors";
import { TenantContext } from "../../utils/tenantContext";

interface TenantStats {
  tenantId: string;
  totalUsers: number;
  totalAppointments: number;
}

const getTenantStatsService = async (tenantId: string): Promise<TenantStats> => {
  const userRepo = AppDataSource.getRepository(User);
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  return await TenantContext.run(tenantId, async () => {
    const totalUsers = await userRepo.count();
    const totalAppointments = await appointmentRepo.count();

    return {
      tenantId,
      totalUsers,
      totalAppointments,
    };
  }) as TenantStats;
};

export default getTenantStatsService;
