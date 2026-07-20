import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entities/tenant.entity";
import { TenantContext } from "../../utils/tenantContext";

const getTenantsService = async (): Promise<Tenant[]> => {
  const tenantRepo = AppDataSource.getRepository(Tenant);

  return await TenantContext.bypass(() =>
    tenantRepo.find({
      order: { createdAt: "DESC" },
    })
  );
};

export default getTenantsService;
