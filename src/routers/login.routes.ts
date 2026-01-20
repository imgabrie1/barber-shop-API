import { Router } from "express";
import { createLoginSchema } from "../schemas/login.schema";
import ensureDataIsValidMiddleware from "../middlewares/ensureDataIsValid.middleware";
import createLoginController from "../controllers/login.controller";
import refreshTokenController from "../controllers/refreshToken.controller";

const loginRoutes: Router = Router();

loginRoutes.post(
  "/",
  ensureDataIsValidMiddleware(createLoginSchema),
  createLoginController
);
loginRoutes.post("/refresh-token", refreshTokenController);

export default loginRoutes;