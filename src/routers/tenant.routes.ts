import { Router } from "express";
import { registerTenantController } from "../controllers/tenant.controller";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { registerTenantSchema } from "../schemas/tenant.schema";

const tenantRoutes: Router = Router();

tenantRoutes.post(
  "/register",
  ensureDataIsValidMiddleware(registerTenantSchema),
  registerTenantController
);

export default tenantRoutes;
