import { Router } from "express";
import { getRevenueController } from "../controllers/admin.controller";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";

const adminRoutes = Router();

adminRoutes.get(
  "/revenue",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  getRevenueController,
);

export default adminRoutes;
