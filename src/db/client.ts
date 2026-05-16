import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { readFileSync } from "fs";
import * as schema from "./schema/index";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { ca: readFileSync("./ca.pem").toString() },
});

pool.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully");
  }
});

export const db = drizzle(pool, { schema });
