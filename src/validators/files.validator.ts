import { z } from "zod";

export const presignedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  folderId: z.number().int().positive().optional(),
});

export const confirmUploadSchema = z.object({
  fileKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  folderId: z.number().int().positive().optional(),
});

export const initiateMultipartSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  folderId: z.number().int().positive().optional(),
});

export const completeMultipartSchema = z.object({
  uploadId: z.string().min(1),
  fileKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  folderId: z.number().int().positive().optional(),
  parts: z
    .array(
      z.object({
        partNumber: z.number().int().min(1),
        etag: z.string().min(1),
      })
    )
    .min(1),
});

export const abortMultipartSchema = z.object({
  uploadId: z.string().min(1),
  fileKey: z.string().min(1),
});

export const moveFileSchema = z.object({
  folderId: z.number().int().positive().nullable(),
});

export const copyFileSchema = z.object({
  folderId: z.number().int().positive().nullable(),
  name: z.string().min(1).max(255).optional(),
});
