import { Hono } from "hono";
import { FileHandlers } from "../handlers/files.handlers";

export const filesRouter = new Hono();
const handlers = new FileHandlers();

filesRouter.post("/presigned-url", ...handlers.getPresignedUrl);
filesRouter.post("/confirm", ...handlers.confirmUpload);

export default filesRouter;
