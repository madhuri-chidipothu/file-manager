import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { readFileSync } from "fs";

const dbUrl = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: { ca: readFileSync("./ca.pem").toString() },
  },
  verbose: true,
  strict: true,
});
