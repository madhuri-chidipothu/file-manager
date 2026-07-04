import { pgTable, serial, integer, varchar, bigint, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { folders } from "./folders";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  storagePath: varchar("storage_path", { length: 1024 }).notNull(),
  contentType: varchar("content_type", { length: 127 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "set null" }),
  starred: boolean("starred").notNull().default(false),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
