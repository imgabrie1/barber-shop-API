import { Router } from "express";
import {
  checkAvailabilityController,
  createAppointmentController,
  deleteAppointmentController,
  getAppointmentByIDcontroller,
  getAppointmentsController,
  getMyAppointmentsController,
  patchAppointmentController,
  updateAppointmentStatusController,
  userCancelAppointmentController,
} from "../controllers/appointments.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../schemas/appointments.schema";
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

appointmentsRoutes.patch(
  "/status/:id",
  ensureUserIsAuthenticatedMiddleware,
  updateAppointmentStatusController,
);
appointmentsRoutes.patch(
  "/me/cancel/:id",
  ensureUserIsAuthenticatedMiddleware,
  userCancelAppointmentController,
);

appointmentsRoutes.delete(
  "/delete/:id",
  ensureUserIsAuthenticatedMiddleware,
  deleteAppointmentController,
);

export default appointmentsRoutes;
