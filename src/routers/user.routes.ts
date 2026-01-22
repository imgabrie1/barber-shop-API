import { Router } from "express";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { userSchema } from "../schemas/users.schema";
import {
  adminDeleteUserController,
  autoDeleteUserController,
  createUserController,
  getUserByIDcontroller,
  getUsersController,
  patchUserController,
} from "../controllers/users.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureIsAdminOrBarberMiddleware from "../middlewares/ensureIsAdminOrBarber.middleware";
import ensureIsAdminMiddleware from "../middlewares/ensureIsAdmin.middleware";

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
  "/:id",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminOrBarberMiddleware,
  getUserByIDcontroller,
);

userRoutes.delete(
  "",
  ensureUserIsAuthenticatedMiddleware,
  autoDeleteUserController,
);

userRoutes.delete(
  "",
  ensureUserIsAuthenticatedMiddleware,
  ensureIsAdminMiddleware,
  adminDeleteUserController,
);

export default userRoutes;
