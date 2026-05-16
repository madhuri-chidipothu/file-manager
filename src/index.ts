import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { onError } from "./utils/onError";
import auth from "./routes/auth.routes";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello Hono" }));
app.route("/users", auth);

app.onError(onError);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
