import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow()
});

export const recipesRelations = relations(recipes, ({ many }) => ({
	recipeIngredients: many(recipeIngredients)
}));

export const ingredients = pgTable('ingredients', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
	recipeIngredients: many(recipeIngredients)
}));

export const recipeIngredients = pgTable('recipe_ingredients', {
	id: serial('id').primaryKey(),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id),
	ingredientId: integer('ingredient_id')
		.notNull()
		.references(() => ingredients.id),
	quantity: varchar('quantity', { length: 50 }).notNull(),
	unit: varchar('unit', { length: 50 })
});

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
	recipe: one(recipes, {
		fields: [recipeIngredients.recipeId],
		references: [recipes.id]
	}),
	ingredient: one(ingredients, {
		fields: [recipeIngredients.ingredientId],
		references: [ingredients.id]
	})
}));
