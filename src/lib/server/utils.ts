import type { TagInput } from './types';

export function mapTags(tags: string[] | undefined): TagInput[] {
	if (!tags) return [];
	else return tags.map((tag) => ({ name: tag }));
}
