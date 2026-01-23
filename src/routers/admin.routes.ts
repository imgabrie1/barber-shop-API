import { Router } from "express";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import {
  createBarberServiceController,
  deleteBarberServiceController,
  getBarberServicesController,
} from "../controllers/barberServices.controller";
import { serviceSchema } from "../schemas/barberServices.schema";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";

const adminRoutes: Router = Router();

adminRoutes.post(
  "/service",
  ensureDataIsValidMiddleware(serviceSchema),
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  createBarberServiceController,
);

adminRoutes.delete(
  "/service/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  deleteBarberServiceController,
);

export default adminRoutes;
