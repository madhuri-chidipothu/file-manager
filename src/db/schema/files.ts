import { pgTable, serial, integer, varchar, bigint, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  storagePath: varchar("storage_path", { length: 1024 }).notNull(),
  contentType: varchar("content_type", { length: 127 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  folderId: varchar("folder_id", { length: 255 }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
