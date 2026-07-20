import { AppDataSource } from "../../data-source";
import { Tenant } from "../../entities/tenant.entity";
import { AppError } from "../../errors";
import { TenantContext } from "../../utils/tenantContext";

interface iToggleTenantStatus {
  id: string;
  isActive: boolean;
}

const toggleTenantStatusService = async ({
  id,
  isActive,
}: iToggleTenantStatus): Promise<Tenant> => {
  const tenantRepo = AppDataSource.getRepository(Tenant);

  const tenant = await TenantContext.bypass(() =>
    tenantRepo.findOneBy({ id })
  );

  if (!tenant) {
    throw new AppError("Tenant não encontrado", 404);
  }

  tenant.isActive = isActive;

  return await TenantContext.bypass(() => tenantRepo.save(tenant));
};

export default toggleTenantStatusService;
