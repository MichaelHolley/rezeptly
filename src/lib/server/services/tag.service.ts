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

export const getAllActiveTags = async (): Promise<Tag[]> => {
	const result = await db.query.tags.findMany({
		where: (tags, { exists }) =>
			exists(db.select().from(recipesToTags).where(eq(recipesToTags.tagId, tags.id))),
		orderBy: (tags, { asc }) => [asc(tags.category), asc(tags.name)]
	});
	return result;
};
