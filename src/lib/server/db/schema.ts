import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	imageUrl: text('image_url'),
	createdAt: timestamp('created_at').defaultNow()
});

export const recipesRelations = relations(recipes, ({ many }) => ({
	ingredients: many(ingredients),
	instructions: many(instructions),
	tags: many(recipesToTags)
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

export const tags = pgTable('tags', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const tagsRelations = relations(tags, ({ many }) => ({
	recipesToTags: many(recipesToTags)
}));

export const recipesToTags = pgTable(
	'recipes_to_tags',
	{
		recipeId: integer('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.recipeId, t.tagId] })
	})
);

export const recipesToTagsRelations = relations(recipesToTags, ({ one }) => ({
	recipe: one(recipes, {
		fields: [recipesToTags.recipeId],
		references: [recipes.id]
	}),
	tag: one(tags, {
		fields: [recipesToTags.tagId],
		references: [tags.id]
	})
}));
