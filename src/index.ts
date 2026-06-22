import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { onError } from "./utils/onError";
import auth from "./routes/auth.routes";
import filesRouter from "./routes/files.routes";
import foldersRouter from "./routes/folders.routes";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) =>
      !origin ||
      origin.startsWith("http://localhost:") ||
      origin === "https://navigator-ui-kappa.vercel.app"
        ? origin
        : undefined,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (c) => c.json({ message: "Hello Hono" }));
app.route("/users", auth);
app.route("/files", filesRouter);
app.route("/folders", foldersRouter);

app.onError(onError);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
