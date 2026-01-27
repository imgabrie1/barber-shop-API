import { Router } from "express";
import { createAppointmentController } from "../controllers/appointments.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { createAppointmentSchema } from "../schemas/appointments.schema";


const appointmentsRoutes: Router = Router();

appointmentsRoutes.post(
  "",
  ensureUserIsAuthenticatedMiddleware,
  ensureDataIsValidMiddleware(createAppointmentSchema),
  createAppointmentController,
);


export default appointmentsRoutes;
