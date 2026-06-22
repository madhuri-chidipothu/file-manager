import { Hono } from "hono";
import { FileHandlers } from "../handlers/files.handlers";

export const filesRouter = new Hono();
const handlers = new FileHandlers();

filesRouter.get("/", ...handlers.getFiles);
filesRouter.post("/presigned-url", ...handlers.getPresignedUrl);
filesRouter.post("/confirm", ...handlers.confirmUpload);
filesRouter.post("/multipart/initiate", ...handlers.initiateMultipart);
filesRouter.post("/multipart/complete", ...handlers.completeMultipart);
filesRouter.delete("/multipart/abort", ...handlers.abortMultipart);
filesRouter.get("/:id", ...handlers.getFile);
filesRouter.get("/:id/download", ...handlers.getDownloadUrl);
filesRouter.post("/:id/star", ...handlers.starFile);
filesRouter.patch("/:id/move", ...handlers.moveFile);
filesRouter.post("/:id/copy", ...handlers.copyFile);
filesRouter.delete("/:id", ...handlers.deleteFile);

export default filesRouter;
