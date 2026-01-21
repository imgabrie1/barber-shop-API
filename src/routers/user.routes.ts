import { Router } from "express";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { userSchema } from "../schemas/users.schema";
import { createUserController, patchUserController } from "../controllers/users.controller";
import ensureUserIsAuthenticatedMiddleware from "../middlewares/ensureUserIsAuthenticated.middleware";

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

export default userRoutes;
