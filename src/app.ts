import "express-async-errors";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { handleErrors } from "./errors";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
  res.status(200).send("ok");
});

app.use(handleErrors);
export default app;
