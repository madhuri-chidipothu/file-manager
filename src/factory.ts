import { createFactory } from "hono/factory";
import type { User } from "./db/schema/index";

type Variables = {
  user_payload: User;
};

const factory = createFactory<{ Variables: Variables }>();

export default factory;
