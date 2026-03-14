import type { Tag } from '$lib/server/types';

class AvailableTags {
	tags = $state<Tag[]>([]);
}

export const AvailableTagsStore = new AvailableTags();
