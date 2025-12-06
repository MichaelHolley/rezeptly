import type { NewTag } from './types';

export function mapTags(tags: string[] | undefined): NewTag[] {
	if (!tags) return [];
	else return tags.map((tag) => ({ name: tag }));
}
