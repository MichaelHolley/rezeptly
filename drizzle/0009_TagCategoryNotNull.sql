-- Remove recipe associations for any remaining uncategorized tags
DELETE FROM "recipes_to_tags" WHERE "tag_id" IN (SELECT "id" FROM "tags" WHERE "category" IS NULL);--> statement-breakpoint
-- Remove any remaining uncategorized tags
DELETE FROM "tags" WHERE "category" IS NULL;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_unique" ON "tags" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_slug_category_unique" UNIQUE("slug","category");