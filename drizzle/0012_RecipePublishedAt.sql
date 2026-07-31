ALTER TABLE "recipes" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
UPDATE "recipes" SET "published_at" = COALESCE("created_at", now());
