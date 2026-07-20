import { Router } from "express";
import {
  getTenantsController,
  toggleTenantStatusController,
  getTenantStatsController,
  registerTenantController,
} from "../controllers/tenant.controller";
import createPlatformLoginController from "../controllers/platformLogin.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureIsSuperAdminMiddleware from "../middlewares/ensureIsSuperAdmin.middleware";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { registerTenantSchema } from "../schemas/tenant.schema";

const platformRoutes: Router = Router();

platformRoutes.post("/login", createPlatformLoginController);

platformRoutes.use(ensureUserIsAuthenticatedMiddleware);
platformRoutes.use(ensureIsSuperAdminMiddleware);

platformRoutes.get("/tenants", getTenantsController);

platformRoutes.post(
  "/tenants",
  ensureDataIsValidMiddleware(registerTenantSchema),
  registerTenantController
);

platformRoutes.patch("/tenants/:id", toggleTenantStatusController);

platformRoutes.get("/tenants/:id/stats", getTenantStatsController);

export default platformRoutes;
