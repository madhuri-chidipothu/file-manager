import { Hono } from "hono";
import { FolderHandlers } from "../handlers/folders.handlers";

export const foldersRouter = new Hono();
const handlers = new FolderHandlers();

foldersRouter.get("/", ...handlers.getFolders);
foldersRouter.post("/", ...handlers.createFolder);
foldersRouter.get("/:id", ...handlers.getFolder);
foldersRouter.patch("/:id", ...handlers.renameFolder);
foldersRouter.post("/:id/star", ...handlers.starFolder);
foldersRouter.delete("/:id", ...handlers.deleteFolder);

export default foldersRouter;
