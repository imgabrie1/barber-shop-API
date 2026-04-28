import { Router } from "express";
import { getRevenueController, updateBarberServiceCommissionController } from "../controllers/admin.controller";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import { adminDeleteUserController } from "../controllers/users.controller";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { barberServiceCommissionSchema } from "../schemas/barberServices.schema";

const adminRoutes = Router();

adminRoutes.get(
  "/revenue",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  getRevenueController,
);

adminRoutes.delete(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  adminDeleteUserController,
);

adminRoutes.patch(
  "/commissions",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  ensureDataIsValidMiddleware(barberServiceCommissionSchema),
  updateBarberServiceCommissionController,
);

export default adminRoutes;
