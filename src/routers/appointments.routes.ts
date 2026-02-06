import { Router } from "express";
import {
  checkAvailabilityController,
  createAppointmentController,
  deleteAppointmentController,
  getAppointmentByIDcontroller,
  getAppointmentsController,
  getMyAppointmentsController,
  patchAppointmentController,
} from "../controllers/appointments.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { createAppointmentSchema, updateAppointmentSchema } from "../schemas/appointments.schema";
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
  getAppointmentsController,
);

appointmentsRoutes.get(
  "/me",
  ensureUserIsAuthenticatedMiddleware,
  getMyAppointmentsController,
);

appointmentsRoutes.get(
  "/availability",
  ensureUserIsAuthenticatedMiddleware,
  checkAvailabilityController,
);

appointmentsRoutes.get(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  getAppointmentByIDcontroller,
);

appointmentsRoutes.patch(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureDataIsValidMiddleware(updateAppointmentSchema),
  patchAppointmentController,
);

export default appointmentsRoutes;
