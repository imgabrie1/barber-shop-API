import { User } from "../../entities/user.entity";
import { Tenant } from "../../entities/tenant.entity";
import roleEnum from "../../enum/role.enum";

declare global {
  namespace Express {
    interface Request {
      id: string;
      role: string;
      user: User;
      tenantId?: string;
      tenant?: Tenant;
      userTenantId?: string;
    }
  }
}
