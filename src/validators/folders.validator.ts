import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.number().int().positive().nullish(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1).max(255),
});
