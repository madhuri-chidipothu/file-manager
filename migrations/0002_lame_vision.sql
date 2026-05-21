ALTER TABLE "otps" ALTER COLUMN "otp" SET DATA TYPE varchar(6);--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "is_used" boolean DEFAULT false NOT NULL;