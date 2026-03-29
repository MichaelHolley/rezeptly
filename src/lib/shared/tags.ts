import type { TagCategory } from '$lib/server/types';

export interface TagCategoryOption {
	key: TagCategory;
	label: string;
}

export const TAG_CATEGORY_CONFIG: TagCategoryOption[] = [
	{ key: 'type', label: 'Type' },
	{ key: 'cuisine', label: 'Cuisine' },
	{ key: 'nutrition', label: 'Nutrition' },
	{ key: 'diet', label: 'Diet' }
];

export const TAG_CATEGORIES: TagCategory[] = TAG_CATEGORY_CONFIG.map((c) => c.key);
