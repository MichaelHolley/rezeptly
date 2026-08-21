CREATE TYPE "public"."recipe_course" AS ENUM('appetizer', 'main', 'dessert');--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "course" "recipe_course";