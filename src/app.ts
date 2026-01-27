import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { handleErrors } from "./errors";
import loginRoutes from "./routers/login.routes";
import userRoutes from "./routers/user.routes";
import adminRoutes from "./routers/admin.routes";
import serviceRoutes from "./routers/services.routes";
import appointmentsRoutes from "./routers/appointments.routes";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/login", loginRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes)
app.use("/service", serviceRoutes)
app.use("/appointment", appointmentsRoutes)


app.get("/health", (_, res) => {
  res.status(200).send("ok");
});

app.use(handleErrors);
export default app;
