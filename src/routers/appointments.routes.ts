import { Router } from "express";
import {
  createAppointmentController,
  getAppointmentByIDcontroller,
  getAppointmentsController,
  getMyAppointmentsController,
} from "../controllers/appointments.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { createAppointmentSchema } from "../schemas/appointments.schema";
import ensureIsAdminOrBarberMiddleware from "../middlewares/ensureIsAdminOrBarber.middleware";

const appointmentsRoutes: Router = Router();

appointmentsRoutes.post(
  "",
  ensureUserIsAuthenticatedMiddleware,
  ensureDataIsValidMiddleware(createAppointmentSchema),
  createAppointmentController,
);

appointmentsRoutes.get(
  "",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminOrBarberMiddleware,
  getAppointmentsController,
);

appointmentsRoutes.get(
  "/me",
  ensureUserIsAuthenticatedMiddleware,
  getMyAppointmentsController,
);

appointmentsRoutes.get(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  getAppointmentByIDcontroller,
);

export default appointmentsRoutes;
