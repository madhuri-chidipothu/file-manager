import { randomUUID } from "crypto";
import factory from "../factory";
import { files } from "../db/schema/index";
import { validateRequestBody } from "../helpers/validationHelpers";
import { generatePresignedUploadUrl } from "../helpers/s3.helper";
import { saveRecord } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";
import { authMiddleware } from "../middlewares/auth.middleware";
import { presignedUrlSchema, confirmUploadSchema } from "../validators/files.validator";
import { OK } from "../constants/httpStatusCodes";
import { PRESIGNED_URL_GENERATED, FILE_UPLOADED } from "../constants/appMessages";

export class FileHandlers {
  getPresignedUrl = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const reqData = await c.req.json();
    const { filename, contentType, fileSize } = validateRequestBody(presignedUrlSchema, reqData);

    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
    const fileKey = `${user.id}/${randomUUID()}${ext}`;
    const expiresIn = Number(process.env.UPLOAD_URL_EXPIRY) || 900;

    const upload_url = await generatePresignedUploadUrl(fileKey, contentType, expiresIn);
    const expires_at = new Date(Date.now() + expiresIn * 1000).toISOString();

    return sendResponse(c, OK, PRESIGNED_URL_GENERATED, { upload_url, file_key: fileKey, expires_at });
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
}
