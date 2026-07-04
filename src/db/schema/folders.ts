import { pgTable, serial, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { users } from "./users";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => folders.id, { onDelete: "set null" }),
  s3Prefix: varchar("s3_prefix", { length: 1024 }).notNull(),
  color: varchar("color", { length: 50 }).notNull().default("ink"),
  icon: varchar("icon", { length: 50 }).notNull().default("fold"),
  starred: boolean("starred").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
