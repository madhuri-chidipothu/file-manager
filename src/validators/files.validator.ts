import { z } from "zod";

export const presignedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
});

export const confirmUploadSchema = z.object({
  fileKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  folderId: z.string().optional(),
});
