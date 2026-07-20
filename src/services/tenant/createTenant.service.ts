import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entities/tenant.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors";
import { iRegisterTenant } from "../../schemas/tenant.schema";
import roleEnum from "../../enum/role.enum";
import { TenantContext } from "../../utils/tenantContext";

const createTenantService = async (
  data: iRegisterTenant
): Promise<{ tenantId: string; slug: string; adminId: string }> => {
  return await TenantContext.bypass(async () => {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const tenantRepo = transactionalEntityManager.getRepository(Tenant);
      const userRepo = transactionalEntityManager.getRepository(User);

      const existingTenant = await tenantRepo.findOneBy({ slug: data.slug });
      if (existingTenant) {
        throw new AppError("Este slug já está em uso", 409);
      }

      const tenant = tenantRepo.create({
        name: data.tenantName,
        slug: data.slug,
      });
      await tenantRepo.save(tenant);

      const adminUser = userRepo.create({
        name: data.adminName,
        phoneNumber: data.adminPhone,
        password: data.adminPassword,
        role: roleEnum.ADMIN,
        tenant: tenant,
      });
      await userRepo.save(adminUser);

      return {
        tenantId: tenant.id,
        slug: tenant.slug,
        adminId: adminUser.id,
      };
    });
  });
};

export default createTenantService;
