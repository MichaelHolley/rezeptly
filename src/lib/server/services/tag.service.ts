import { error } from '@sveltejs/kit';
import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import { db } from '../db';
import { recipesToTags, tags } from '../db/schema';
import type { Tag, TagInput } from '../types';
import { generateSlug } from './util/generate-slug';

export type TagWithUsage = Tag & { recipeCount: number };

export { TAG_CATEGORIES, TAG_CATEGORY_CONFIG } from '$lib/shared/tags';

export async function upsertTags(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	inputs: TagInput[]
): Promise<Tag[]> {
	if (!inputs.length) return [];

	// Deduplicate by category+slug (last one wins per category+slug pair)
	const seen = new Map<string, TagInput>();
	for (const t of inputs) {
		const trimmedName = t.name.trim();
		if (!trimmedName) continue;
		const slug = generateSlug(trimmedName);
		seen.set(`${t.category}::${slug}`, { name: trimmedName, category: t.category });
	}

	const uniqueInputs = [...seen.values()];
	if (!uniqueInputs.length) return [];

	const allTags: Tag[] = [];
	for (const input of uniqueInputs) {
		const slug = generateSlug(input.name);
		if (!slug) continue;

		// Find existing tag by slug + category match
		const existingRows = await tx.select().from(tags).where(eq(tags.slug, slug));
		const existing = existingRows.find((r) => r.category === input.category) ?? null;

		if (existing) {
			allTags.push(existing);
		} else {
			const [newTag] = await tx
				.insert(tags)
				.values({ name: input.name, slug, category: input.category })
				.onConflictDoNothing()
				.returning();

			if (newTag) {
				allTags.push(newTag);
			} else {
				// Race condition: another transaction inserted the same slug+category
				const rows = await tx.select().from(tags).where(eq(tags.slug, slug));
				const raceTag = rows.find((r) => r.category === input.category);
				if (raceTag) allTags.push(raceTag);
			}
		}
	}

	return allTags;
}

export const getAllTags = async (): Promise<Tag[]> => {
	return await db.query.tags.findMany({
		orderBy: (tags, { asc }) => [asc(tags.category), asc(tags.name)]
	});
};

export const getAllActiveTags = async (): Promise<Tag[]> => {
	const result = await db.query.tags.findMany({
		where: (tags, { exists }) =>
			exists(db.select().from(recipesToTags).where(eq(recipesToTags.tagId, tags.id))),
		orderBy: (tags, { asc }) => [asc(tags.category), asc(tags.name)]
	});
	return result;
};

export const getAllTagsWithUsage = async (): Promise<TagWithUsage[]> => {
	const rows = await db
		.select({
			id: tags.id,
			name: tags.name,
			slug: tags.slug,
			category: tags.category,
			recipeCount: count(recipesToTags.recipeId)
		})
		.from(tags)
		.leftJoin(recipesToTags, eq(recipesToTags.tagId, tags.id))
		.groupBy(tags.id)
		.orderBy(asc(tags.category), asc(tags.name));

	return rows;
};

const resolveSlug = async (input: TagInput, excludeTagId?: number): Promise<string> => {
	const name = input.name.trim();
	const slug = generateSlug(name);

	if (!slug) {
		error(400, {
			message: 'Tag name must contain at least one letter or number',
			code: 'VALIDATION_ERROR'
		});
	}

	const conflict = await db.query.tags.findFirst({
		where: excludeTagId
			? and(eq(tags.slug, slug), eq(tags.category, input.category), ne(tags.id, excludeTagId))
			: and(eq(tags.slug, slug), eq(tags.category, input.category))
	});

	if (conflict) {
		error(409, {
			message: `A "${input.category}" tag named "${conflict.name}" already exists`,
			code: 'VALIDATION_ERROR'
		});
	}

	return slug;
};

export const createTag = async (input: TagInput): Promise<Tag> => {
	const slug = await resolveSlug(input);

	const [newTag] = await db
		.insert(tags)
		.values({ name: input.name.trim(), slug, category: input.category })
		.returning();

	return newTag;
};

export const updateTag = async (id: number, input: TagInput): Promise<Tag> => {
	const slug = await resolveSlug(input, id);

	const [updatedTag] = await db
		.update(tags)
		.set({ name: input.name.trim(), slug, category: input.category })
		.where(eq(tags.id, id))
		.returning();

	if (!updatedTag) {
		error(404, { message: `Tag with ID ${id} not found`, code: 'NOT_FOUND' });
	}

	return updatedTag;
};

export const deleteTag = async (id: number, targetTagId?: number): Promise<void> => {
	if (targetTagId === id) {
		error(400, { message: 'A tag cannot be migrated to itself', code: 'VALIDATION_ERROR' });
	}

	await db.transaction(async (tx) => {
		if (targetTagId !== undefined) {
			const target = await tx.query.tags.findFirst({ where: eq(tags.id, targetTagId) });

			if (!target) {
				error(404, { message: `Tag with ID ${targetTagId} not found`, code: 'NOT_FOUND' });
			}

			await tx
				.insert(recipesToTags)
				.select(
					tx
						.select({
							recipeId: recipesToTags.recipeId,
							tagId: sql<number>`${targetTagId}::integer`.as('tag_id')
						})
						.from(recipesToTags)
						.where(eq(recipesToTags.tagId, id))
				)
				.onConflictDoNothing();
		}

		await tx.delete(recipesToTags).where(eq(recipesToTags.tagId, id));

		const [deleted] = await tx.delete(tags).where(eq(tags.id, id)).returning();

		if (!deleted) {
			error(404, { message: `Tag with ID ${id} not found`, code: 'NOT_FOUND' });
		}
	});
};
