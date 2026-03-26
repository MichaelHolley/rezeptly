CREATE TYPE "public"."tag_category" AS ENUM('type', 'cuisine', 'nutrition', 'diet');--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "category" "tag_category";--> statement-breakpoint
-- Backfill slug from name: lowercase, replace spaces/special chars with hyphens
UPDATE "tags" SET "slug" = regexp_replace(lower(trim("name")), '[^a-z0-9]+', '-', 'g');--> statement-breakpoint
-- Remove leading/trailing hyphens from slug
UPDATE "tags" SET "slug" = trim(both '-' from "slug");--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
-- Normalize legacy tag variants and assign categories
-- type: Kuchen, Nachtisch, Nudeln, Salat, Beilage, Slow-Cooker, quick & easy, Basics, Sauce
UPDATE "tags" SET "category" = 'type'
  WHERE lower(trim("name")) IN ('kuchen','nachtisch','nudeln','salat','beilage','slow-cooker','quick & easy','basics','sauce');--> statement-breakpoint
-- cuisine: französisch, italienisch, mexikanisch, deutsch (including emoji variants)
UPDATE "tags" SET "category" = 'cuisine', "name" = 'französisch', "slug" = 'franzosisch'
  WHERE lower(trim("name")) IN ('französisch','🇫🇷 französisch','franzosisch','franzosisch');--> statement-breakpoint
UPDATE "tags" SET "category" = 'cuisine', "name" = 'italienisch', "slug" = 'italienisch'
  WHERE lower(trim("name")) IN ('italienisch','🇮🇹 italienisch');--> statement-breakpoint
UPDATE "tags" SET "category" = 'cuisine', "name" = 'mexikanisch', "slug" = 'mexikanisch'
  WHERE lower(trim("name")) IN ('mexikanisch','🇲🇽 mexikanisch');--> statement-breakpoint
UPDATE "tags" SET "category" = 'cuisine', "name" = 'deutsch', "slug" = 'deutsch'
  WHERE lower(trim("name")) IN ('deutsch','🇩🇪 deutsch');--> statement-breakpoint
-- diet: vegan, Hähnchen
UPDATE "tags" SET "category" = 'diet'
  WHERE lower(trim("name")) IN ('vegan','hähnchen');--> statement-breakpoint
-- Add unique constraint: (slug, category) for categorized tags
CREATE UNIQUE INDEX "tags_slug_category_unique" ON "tags" ("slug", "category") WHERE "category" IS NOT NULL;--> statement-breakpoint
-- For uncategorized tags (NULL category), keep uniqueness by slug
CREATE UNIQUE INDEX "tags_slug_unique_uncategorized" ON "tags" ("slug") WHERE "category" IS NULL;
