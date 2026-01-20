import { Router } from "express";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import { userSchema } from "../schemas/users.schema";
import { createUserController } from "../controllers/users.controller";


const userRoutes: Router = Router();

userRoutes.post(
  "",
  ensureDataIsValidMiddleware(userSchema),
  createUserController,
);

export default userRoutes;
