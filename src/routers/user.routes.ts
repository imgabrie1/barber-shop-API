import { Router } from "express";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { userSchema } from "../schemas/users.schema";
import {
  autoDeleteUserController,
  createUserController,
  getUsersController,
  patchUserController,
} from "../controllers/users.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";
import ensureIsAdminOrBarberMiddleware from "../middlewares/ensureIsAdminOrBarber.middleware";

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

userRoutes.delete(
  "",
  ensureUserIsAuthenticatedMiddleware,
  autoDeleteUserController,
);

export default userRoutes;
