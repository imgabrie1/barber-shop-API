import { Router } from "express";
import {
  createBarberServiceController,
  deleteBarberServiceController,
  getBarberServiceByIDController,
  getBarberServicesController,
  patchServiceController,
} from "../controllers/barberServices.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { serviceSchema, updateServiceSchema } from "../schemas/barberServices.schema";

const serviceRoutes: Router = Router();

serviceRoutes.post(
  "",
  ensureDataIsValidMiddleware(serviceSchema),
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  createBarberServiceController,
);

serviceRoutes.delete(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  deleteBarberServiceController,
);

serviceRoutes.get(
  "",
  ensureUserIsAuthenticatedMiddleware,
  getBarberServicesController,
);

serviceRoutes.get(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  getBarberServiceByIDController,
);

serviceRoutes.patch(
  "/:id",
  ensureDataIsValidMiddleware(updateServiceSchema),
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  patchServiceController,
);

export default serviceRoutes;
