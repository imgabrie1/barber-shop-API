import { Router } from "express";
import {
  getRevenueController,
  createShopController,
  updateShopController,
  deleteShopController,
  cleanupOldRevenueController,
} from "../controllers/admin.controller";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import ensureIsAdminOrManagerMiddleware from "../middlewares/ensureIsAdminOrManager.middleware";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import { adminDeleteUserController } from "../controllers/users.controller";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import {
  updateShopSchema,
} from "../schemas/barberServices.schema";

const adminRoutes = Router();

adminRoutes.get(
  "/revenue",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminOrManagerMiddleware,
  getRevenueController,
);

adminRoutes.delete(
  "/revenue/cleanup",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  cleanupOldRevenueController,
);

adminRoutes.post(
  "/shops",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  createShopController,
);

adminRoutes.patch(
  "/shops/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  ensureDataIsValidMiddleware(updateShopSchema),
  updateShopController,
);

adminRoutes.delete(
  "/shops/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  deleteShopController,
);

adminRoutes.delete(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  adminDeleteUserController,
);

export default adminRoutes;
