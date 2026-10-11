import type { Tag } from '#lib/server/types.js';

class AvailableTags {
	tags = $state<Tag[]>([]);
}

export const AvailableTagsStore = new AvailableTags();
