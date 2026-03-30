ALTER TABLE "tags" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "ingredients_recipe_id_idx" ON "ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "instructions_recipe_id_idx" ON "instructions" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipes_to_tags_tag_id_idx" ON "recipes_to_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_slug_category_unique" UNIQUE("slug","category");