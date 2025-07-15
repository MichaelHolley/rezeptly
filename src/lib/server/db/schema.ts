import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow()
});

export const recipesRelations = relations(recipes, ({ many }) => ({
	ingredients: many(ingredients),
	instructions: many(instructions)
}));

export const ingredients = pgTable('ingredients', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' })
});

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
	recipe: one(recipes, {
		fields: [ingredients.recipeId],
		references: [recipes.id]
	})
}));

export const instructions = pgTable('instructions', {
	id: serial('id').primaryKey(),
	heading: text('heading'),
	instructions: text('instructions').notNull(),
	stepOrder: integer('step_order').notNull(),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' })
});

export const instructionsRelations = relations(instructions, ({ one }) => ({
	recipe: one(recipes, {
		fields: [instructions.recipeId],
		references: [recipes.id]
	})
}));
