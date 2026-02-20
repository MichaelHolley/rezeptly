ALTER TABLE "recipes" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_slug_unique" UNIQUE("slug");