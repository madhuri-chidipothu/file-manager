DROP TABLE IF EXISTS "tokens";--> statement-breakpoint
DROP TABLE IF EXISTS "otps";--> statement-breakpoint
DROP TABLE IF EXISTS "users";--> statement-breakpoint
CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255),
  "is_verified" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE TABLE "otps" (
  "id" serial PRIMARY KEY,
  "email" varchar(255) NOT NULL,
  "otp" varchar(4) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE TABLE "tokens" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "access_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
