import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isUsed: boolean("is_used").notNull().default(false),
});

export type Otp = typeof otps.$inferSelect;
