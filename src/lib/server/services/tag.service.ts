import { eq } from 'drizzle-orm';
import { db } from '../db';
import { recipesToTags, tags } from '../db/schema';
import type { Tag, TagInput } from '../types';
import { generateSlug } from './util/generate-slug';

export { TAG_CATEGORIES, TAG_CATEGORY_CONFIG } from '$lib/shared/tags';

/**
 * Upserts tags within a transaction and returns resolved Tag rows.
 */
export async function upsertTags(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	inputs: TagInput[]
): Promise<Tag[]> {
	if (!inputs.length) return [];

	// Deduplicate: for categorized tags, key by category (last one wins per category)
	// For uncategorized tags, key by slug
	const seen = new Map<string, TagInput>();
	for (const t of inputs) {
		const trimmedName = t.name.trim();
		if (!trimmedName) continue;
		const slug = generateSlug(trimmedName);
		const key = t.category ? `cat::${t.category}::${slug}` : `slug::${slug}`;
		seen.set(key, { name: trimmedName, category: t.category ?? null });
	}

	const uniqueInputs = [...seen.values()];
	if (!uniqueInputs.length) return [];

	const allTags: Tag[] = [];
	for (const input of uniqueInputs) {
		const slug = generateSlug(input.name);
		if (!slug) continue;

		// Find existing tag by slug + category match
		const existingRows = await tx.select().from(tags).where(eq(tags.slug, slug));
		const existing = input.category
			? (existingRows.find((r) => r.category === input.category) ?? null)
			: (existingRows.find((r) => r.category === null) ?? null);

		if (existing) {
			allTags.push(existing);
		} else {
			try {
				const [newTag] = await tx
					.insert(tags)
					.values({ name: input.name, slug, category: input.category ?? null })
					.returning();
				allTags.push(newTag);
			} catch {
				// Race condition: refetch
				const rows = await tx.select().from(tags).where(eq(tags.slug, slug));
				const raceTag = input.category
					? rows.find((r) => r.category === input.category)
					: rows.find((r) => r.category === null);
				if (raceTag) allTags.push(raceTag);
			}
		}
	}

	return allTags;
}

export const getAllActiveTags = async (): Promise<Tag[]> => {
	const result = await db.query.tags.findMany({
		where: (tags, { exists }) =>
			exists(db.select().from(recipesToTags).where(eq(recipesToTags.tagId, tags.id))),
		orderBy: (tags, { asc }) => [asc(tags.category), asc(tags.name)]
	});
	return result;
};
