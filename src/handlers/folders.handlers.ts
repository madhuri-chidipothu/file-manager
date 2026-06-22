import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import factory from "../factory";
import { folders } from "../db/schema/index";
import { db } from "../db/client";
import { validateRequestBody } from "../helpers/validationHelpers";
import { createFolderMarkerInS3 } from "../helpers/s3.helper";
import {
  saveRecord,
  getRecordByPrimaryKey,
  updateRecordById,
  deleteRecordById,
} from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createFolderSchema, renameFolderSchema } from "../validators/folders.validator";
import { OK, CREATED } from "../constants/httpStatusCodes";
import {
  FOLDER_CREATED,
  FOLDERS_FETCHED,
  FOLDER_FETCHED,
  FOLDER_UPDATED,
  FOLDER_DELETED,
  FOLDER_STARRED,
  FOLDER_UNSTARRED,
} from "../constants/appMessages";
import NotFoundException from "../exceptions/notFoundException";

export class FolderHandlers {
  getFolders = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const folderList = await db
      .select()
      .from(folders)
      .where(eq(folders.userId, user.id));
    return sendResponse(c, OK, FOLDERS_FETCHED, folderList);
  });

  getFolder = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));
    const folder = await getRecordByPrimaryKey(folders, id);
    if (!folder || folder.userId !== user.id) throw new NotFoundException("Folder not found");
    return sendResponse(c, OK, FOLDER_FETCHED, folder);
  });

  createFolder = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const reqData = await c.req.json();
    const { name, parentId } = validateRequestBody(createFolderSchema, reqData);

    const s3Prefix = `${user.id}/${randomUUID()}/`;
    await createFolderMarkerInS3(s3Prefix);

    const folder = await saveRecord(folders, {
      userId: user.id,
      name,
      parentId: parentId ?? null,
      s3Prefix,
    });

    return sendResponse(c, CREATED, FOLDER_CREATED, folder);
  });

  renameFolder = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));
    const reqData = await c.req.json();
    const { name } = validateRequestBody(renameFolderSchema, reqData);

    const folder = await getRecordByPrimaryKey(folders, id);
    if (!folder || folder.userId !== user.id) throw new NotFoundException("Folder not found");

    const updated = await updateRecordById(folders, id, { name, updatedAt: new Date() });
    return sendResponse(c, OK, FOLDER_UPDATED, updated);
  });

  starFolder = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));

    const folder = await getRecordByPrimaryKey(folders, id);
    if (!folder || folder.userId !== user.id) throw new NotFoundException("Folder not found");

    const updated = await updateRecordById(folders, id, {
      starred: !folder.starred,
      updatedAt: new Date(),
    });
    const message = updated.starred ? FOLDER_STARRED : FOLDER_UNSTARRED;
    return sendResponse(c, OK, message, updated);
  });

  deleteFolder = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const id = Number(c.req.param("id"));

    const folder = await getRecordByPrimaryKey(folders, id);
    if (!folder || folder.userId !== user.id) throw new NotFoundException("Folder not found");

    await deleteRecordById(folders, id);
    return sendResponse(c, OK, FOLDER_DELETED, null);
  });
}
