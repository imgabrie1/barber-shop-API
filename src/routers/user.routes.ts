import { Router } from "express";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { userSchema } from "../schemas/users.schema";
import {
  adminDeleteUserController,
  autoDeleteUserController,
  createUserController,
  getBarbersController,
  getUserByIDcontroller,
  getUsersController,
  patchUserController,
} from "../controllers/users.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureIsAdminOrBarberMiddleware from "../middlewares/ensureIsAdminOrBarber.middleware";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";
import { getBarberCommissionRevenueController } from "../controllers/barberRevenue.controller";

const userRoutes: Router = Router();

userRoutes.post(
  "",
  ensureDataIsValidMiddleware(userSchema),
  createUserController,
);

userRoutes.patch(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  patchUserController,
);

userRoutes.get(
  "",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminOrBarberMiddleware,
  getUsersController,
);

userRoutes.get(
  "/barber",
  ensureUserIsAuthenticatedMiddleware,
  getBarbersController,
);

userRoutes.get(
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminOrBarberMiddleware,
  getUserByIDcontroller,
);

userRoutes.get(
  "/me/revenue",
  ensureUserIsAuthenticatedMiddleware,
  getBarberCommissionRevenueController,
);

userRoutes.delete(
  "",
  ensureUserIsAuthenticatedMiddleware,
  autoDeleteUserController,
);


export default userRoutes;
