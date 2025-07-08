CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"targeted_persons" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
