ALTER TABLE "recipes_to_tags" DROP CONSTRAINT "recipes_to_tags_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "recipes_to_tags" ADD CONSTRAINT "recipes_to_tags_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;