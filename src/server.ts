import app from "./app";
import axios from "axios";
import { AppDataSource } from "./data-source";

const PORT: number = Number(process.env.PORT) || 3000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

AppDataSource.initialize()

  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      if (process.env.NODE_ENV === "production") {
        const interval = 5 * 60 * 1000;
        setInterval(async () => {
          try {
            await axios.get(`${SERVER_URL}/health`);
            console.log("Keep-alive ping enviado");
          } catch (err) {
            console.error("Erro ao enviar keep-alive:", (err as Error).message);
          }
        }, interval);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });
