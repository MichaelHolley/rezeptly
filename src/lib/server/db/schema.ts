import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	targetedPersons: integer('targeted_persons').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});
