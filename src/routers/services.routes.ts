import { Router } from "express";
import {
  getBarberServiceByIDController,
  getBarberServicesController,
} from "../controllers/barberServices.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";

const serviceRoutes: Router = Router();

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

export default serviceRoutes;
