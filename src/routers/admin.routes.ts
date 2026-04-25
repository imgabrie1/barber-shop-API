import { Router } from "express";
import { getRevenueController } from "../controllers/admin.controller";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import { adminDeleteUserController } from "../controllers/users.controller";

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

export default adminRoutes;
