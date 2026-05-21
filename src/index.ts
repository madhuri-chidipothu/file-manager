import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { onError } from "./utils/onError";
import auth from "./routes/auth.routes";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) =>
      !origin || origin.startsWith("http://localhost:") ? origin : undefined,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (c) => c.json({ message: "Hello Hono" }));
app.route("/users", auth);

app.onError(onError);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
