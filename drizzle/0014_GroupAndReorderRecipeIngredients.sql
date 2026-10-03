CREATE TABLE "ingredient_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"section_order" integer NOT NULL,
	"recipe_id" integer NOT NULL
);
--> statement-breakpoint
DROP INDEX "ingredients_recipe_id_idx";--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "ingredient_order" integer;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "section_id" integer;--> statement-breakpoint
WITH ordered_ingredients AS (
	SELECT "id", row_number() OVER (PARTITION BY "recipe_id" ORDER BY "id") AS "ingredient_order"
	FROM "ingredients"
)
UPDATE "ingredients"
SET "ingredient_order" = ordered_ingredients."ingredient_order"
FROM ordered_ingredients
WHERE "ingredients"."id" = ordered_ingredients."id";--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "ingredient_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredient_sections" ADD CONSTRAINT "ingredient_sections_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ingredient_sections_recipe_order_idx" ON "ingredient_sections" USING btree ("recipe_id","section_order");--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_section_id_ingredient_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."ingredient_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ingredients_recipe_section_order_idx" ON "ingredients" USING btree ("recipe_id","section_id","ingredient_order");
