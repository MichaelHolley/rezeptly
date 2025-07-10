import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow()
});

export const recipesRelations = relations(recipes, ({ many }) => ({
	ingredients: many(ingredients)
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
