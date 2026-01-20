import fs from "fs";
import "dotenv/config";
import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";

const dataSourceConfig = (): DataSourceOptions => {
  const entitiesPath: string = path.join(__dirname, "./entities/**.{ts,js}");
  const migrationsPath: string = path.join(
    __dirname,
    "./migrations/**.{ts,js}",
  );

  const dbUrl: string | undefined = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("Env var DATABASE_URL does not exist");
  }

  const nodeEnv: string | undefined = process.env.NODE_ENV;

  if (nodeEnv === "test") {
    return {
      type: "sqlite",
      database: ":memory:",
      synchronize: true,
      entities: [entitiesPath],
    };
  }

  // const getCaCert = () => {
  //   if (process.env.DB_SSL_CA) {
  //     return process.env.DB_SSL_CA;
  //   }
  //   const caPath = path.resolve(__dirname, "../cert/ca.pem");
  //   return fs.readFileSync(caPath).toString();
  // };

  const sslConfig =
    process.env.NODE_ENV === "production"
      ? {
          // ca: getCaCert(),

          rejectUnauthorized: true,
        }
      : { rejectUnauthorized: false };

  console.log("--- DATABASE DEBUG ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("SSL Config:", sslConfig);
  console.log("--- END DATABASE DEBUG ---");

  return {
    type: "postgres",
    url: dbUrl,
    synchronize: false,
    ssl: sslConfig,
    logging: true,
    migrations: [migrationsPath],
    entities: [entitiesPath],
  };
};

const AppDataSource = new DataSource(dataSourceConfig());

export { AppDataSource };
