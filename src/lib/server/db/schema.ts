import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: integer('name').notNull(),
	description: integer('description').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});
