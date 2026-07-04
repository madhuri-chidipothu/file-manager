import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import factory from "../factory";
import { files, folders } from "../db/schema/index";
import { db } from "../db/client";
import { validateRequestBody } from "../helpers/validationHelpers";
import { generatePresignedUploadUrl, generatePresignedDownloadUrl, copyObjectInS3, deleteObjectFromS3, createFolderMarkerInS3, initiateMultipartUpload, generatePresignedPartUrl, completeMultipartUpload, abortMultipartUpload } from "../helpers/s3.helper";
import { saveRecord, getRecordByPrimaryKey, updateRecordById, deleteRecordById } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";
import { authMiddleware } from "../middlewares/auth.middleware";
import { presignedUrlSchema, confirmUploadSchema, moveFileSchema, copyFileSchema, initiateMultipartSchema, completeMultipartSchema, abortMultipartSchema } from "../validators/files.validator";
import { OK } from "../constants/httpStatusCodes";
import {
  PRESIGNED_URL_GENERATED,
  FILE_UPLOADED,
  FILES_FETCHED,
  FILE_FETCHED,
  FILE_STARRED,
  FILE_UNSTARRED,
  FILE_DOWNLOAD_URL,
  FILE_DELETED,
  FILE_MOVED,
  FILE_COPIED,
  MULTIPART_INITIATED,
  MULTIPART_COMPLETED,
  MULTIPART_ABORTED,
} from "../constants/appMessages";

function fileExt(storagePath: string): string {
  return storagePath.includes(".") ? storagePath.slice(storagePath.lastIndexOf(".")) : "";
}
import NotFoundException from "../exceptions/notFoundException";
import type { Folder } from "../db/schema/folders";

async function getOrCreateRecentFolder(userId: number): Promise<Folder> {
  const existing = await db
    .select()
    .from(folders)
    .where(and(eq(folders.userId, userId), eq(folders.name, "recent")))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const s3Prefix = `${userId}/${randomUUID()}/`;
  await createFolderMarkerInS3(s3Prefix);

  return saveRecord(folders, { userId, name: "recent", parentId: null, s3Prefix });
}

export class FileHandlers {
  getFiles = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const fileList = await db
      .select()
      .from(files)
      .where(eq(files.userId, user.id));
    return sendResponse(c, OK, FILES_FETCHED, fileList);
  });

  getFile = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));
    const file = await getRecordByPrimaryKey(files, id);
    if (!file || file.userId !== user.id) throw new NotFoundException("File not found");
    return sendResponse(c, OK, FILE_FETCHED, file);
  });

  getPresignedUrl = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const reqData = await c.req.json();
    const { filename, contentType, fileSize, folderId } = validateRequestBody(presignedUrlSchema, reqData);

    let folder: Folder;
    if (folderId != null) {
      const found = await getRecordByPrimaryKey(folders, folderId);
      if (!found || found.userId !== user.id) throw new NotFoundException("Folder not found");
      folder = found;
    } else {
      folder = await getOrCreateRecentFolder(user.id);
    }

    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
    const fileKey = `${folder.s3Prefix}${randomUUID()}${ext}`;
    const expiresIn = Number(process.env.UPLOAD_URL_EXPIRY) || 900;

    const upload_url = await generatePresignedUploadUrl(fileKey, contentType, expiresIn);
    const expires_at = new Date(Date.now() + expiresIn * 1000).toISOString();

    return sendResponse(c, OK, PRESIGNED_URL_GENERATED, {
      upload_url,
      file_key: fileKey,
      folder_id: folder.id,
      expires_at,
    });
  });

  confirmUpload = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const reqData = await c.req.json();
    const { fileKey, filename, contentType, fileSize, folderId } = validateRequestBody(confirmUploadSchema, reqData);

    const record = await saveRecord(files, {
      userId: user.id,
      name: filename,
      storagePath: fileKey,
      contentType,
      sizeBytes: fileSize,
      folderId: folderId ?? null,
    });

    return sendResponse(c, OK, FILE_UPLOADED, record);
  });

  getDownloadUrl = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));

    const file = await getRecordByPrimaryKey(files, id);
    if (!file || file.userId !== user.id) throw new NotFoundException("File not found");

    const expiresIn = Number(process.env.DOWNLOAD_URL_EXPIRY) || 900;
    const url = await generatePresignedDownloadUrl(file.storagePath, expiresIn);

    return sendResponse(c, OK, FILE_DOWNLOAD_URL, { url });
  });

  starFile = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));

    const file = await getRecordByPrimaryKey(files, id);
    if (!file || file.userId !== user.id) throw new NotFoundException("File not found");

    const updated = await updateRecordById(files, id, {
      starred: !file.starred,
      updatedAt: new Date(),
    });
    const message = updated.starred ? FILE_STARRED : FILE_UNSTARRED;
    return sendResponse(c, OK, message, updated);
  });

  deleteFile = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));

    const file = await getRecordByPrimaryKey(files, id);
    if (!file || file.userId !== user.id) throw new NotFoundException("File not found");

    await deleteObjectFromS3(file.storagePath);
    await deleteRecordById(files, id);

    return sendResponse(c, OK, FILE_DELETED, null);
  });

  moveFile = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));
    const { folderId } = validateRequestBody(moveFileSchema, await c.req.json());

    const file = await getRecordByPrimaryKey(files, id);
    if (!file || file.userId !== user.id) throw new NotFoundException("File not found");

    let newKey: string;
    if (folderId != null) {
      const targetFolder = await getRecordByPrimaryKey(folders, folderId);
      if (!targetFolder || targetFolder.userId !== user.id) throw new NotFoundException("Folder not found");
      newKey = `${targetFolder.s3Prefix}${randomUUID()}${fileExt(file.storagePath)}`;
    } else {
      newKey = `${user.id}/${randomUUID()}${fileExt(file.storagePath)}`;
    }

    await copyObjectInS3(file.storagePath, newKey);
    await deleteObjectFromS3(file.storagePath);

    const updated = await updateRecordById(files, id, {
      folderId: folderId ?? null,
      storagePath: newKey,
      updatedAt: new Date(),
    });
    return sendResponse(c, OK, FILE_MOVED, updated);
  });

  initiateMultipart = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const { filename, contentType, fileSize, folderId } = validateRequestBody(initiateMultipartSchema, await c.req.json());

    let folder: Folder;
    if (folderId != null) {
      const found = await getRecordByPrimaryKey(folders, folderId);
      if (!found || found.userId !== user.id) throw new NotFoundException("Folder not found");
      folder = found;
    } else {
      folder = await getOrCreateRecentFolder(user.id);
    }

    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
    const fileKey = `${folder.s3Prefix}${randomUUID()}${ext}`;

    const uploadId = await initiateMultipartUpload(fileKey, contentType);

    const partSize = Number(process.env.MULTIPART_PART_SIZE) || 10485760;
    const partCount = Math.ceil(fileSize / partSize);
    const expiresIn = Number(process.env.UPLOAD_URL_EXPIRY) || 900;

    const parts = await Promise.all(
      Array.from({ length: partCount }, (_, i) =>
        generatePresignedPartUrl(fileKey, uploadId, i + 1, expiresIn).then((url) => ({
          partNumber: i + 1,
          url,
        }))
      )
    );

    const expires_at = new Date(Date.now() + expiresIn * 1000).toISOString();

    return sendResponse(c, OK, MULTIPART_INITIATED, {
      upload_id: uploadId,
      file_key: fileKey,
      folder_id: folder.id,
      part_size: partSize,
      parts,
      expires_at,
    });
  });

  completeMultipart = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const { uploadId, fileKey, filename, contentType, fileSize, folderId, parts } = validateRequestBody(
      completeMultipartSchema,
      await c.req.json()
    );

    await completeMultipartUpload(
      fileKey,
      uploadId,
      parts.map((p) => ({ PartNumber: p.partNumber, ETag: p.etag }))
    );

    const record = await saveRecord(files, {
      userId: user.id,
      name: filename,
      storagePath: fileKey,
      contentType,
      sizeBytes: fileSize,
      folderId: folderId ?? null,
    });

    return sendResponse(c, OK, MULTIPART_COMPLETED, record);
  });

  abortMultipart = factory.createHandlers(authMiddleware, async (c) => {
    const { uploadId, fileKey } = validateRequestBody(abortMultipartSchema, await c.req.json());

    await abortMultipartUpload(fileKey, uploadId);

    return sendResponse(c, OK, MULTIPART_ABORTED, null);
  });

  copyFile = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));
    const { folderId, name } = validateRequestBody(copyFileSchema, await c.req.json());

    const file = await getRecordByPrimaryKey(files, id);
    if (!file || file.userId !== user.id) throw new NotFoundException("File not found");

    let newKey: string;
    if (folderId != null) {
      const targetFolder = await getRecordByPrimaryKey(folders, folderId);
      if (!targetFolder || targetFolder.userId !== user.id) throw new NotFoundException("Folder not found");
      newKey = `${targetFolder.s3Prefix}${randomUUID()}${fileExt(file.storagePath)}`;
    } else {
      newKey = `${user.id}/${randomUUID()}${fileExt(file.storagePath)}`;
    }

    await copyObjectInS3(file.storagePath, newKey);

    const newRecord = await saveRecord(files, {
      userId: user.id,
      name: name ?? file.name,
      storagePath: newKey,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      folderId: folderId ?? null,
    });

    return sendResponse(c, OK, FILE_COPIED, newRecord);
  });
}
