import fs from "fs";
import "dotenv/config";
import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";
import { TenantSubscriber } from "./subscribers/tenant.subscriber";

const dataSourceConfig = (): DataSourceOptions => {
  const entitiesPath: string = path.join(__dirname, "./entities/**.{ts,js}");
  const migrationsPath: string = path.join(
    __dirname,
    "./migrations/**.{ts,js}"
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

  const getCaCert = (): string => {
    const raw = process.env.DB_SSL_CA
      ? process.env.DB_SSL_CA
      : fs.readFileSync(path.resolve(__dirname, "../cert/ca.pem")).toString();

    return raw.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
  };

  const cleanDbUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");

  const sslConfig =
    process.env.NODE_ENV === "production"
      ? {
          ca: [getCaCert()],
          rejectUnauthorized: true,
        }
      : { rejectUnauthorized: false };

  console.log("--- DATABASE DEBUG ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Clean URL (sem sslmode):", cleanDbUrl.replace(/\/\/.*@/, "//[REDACTED]@"));
  console.log("CA cert primeiros 60 chars:", getCaCert().slice(0, 60));
  console.log("--- END DATABASE DEBUG ---");

  return {
    type: "postgres",
    url: cleanDbUrl,
    synchronize: false,
    ssl: sslConfig,
    logging: false,
    migrationsRun: true,
    migrations: [migrationsPath],
    entities: [entitiesPath],
    subscribers: [TenantSubscriber],
  };
};

const AppDataSource = new DataSource(dataSourceConfig());

export { AppDataSource };

