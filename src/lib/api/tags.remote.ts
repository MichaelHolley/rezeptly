import { form } from '$app/server';
import { guardedQuery, userCanWrite } from '$lib/server/auth/permissions';
import { tagCategoryEnum } from '$lib/server/db/schema';
import * as tagService from '$lib/server/services/tag.service';
import { z } from 'zod';
import { throwNewPermissionError } from '../server/error';
import { getAvailableTags, getRecipesMetadata } from './recipes.remote';

const tagIdSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number());

const nameSchema = z.string().trim().min(1, 'Name is required');
const categorySchema = z.enum(tagCategoryEnum.enumValues);

export const getManagedTags = guardedQuery(async () => {
	return await tagService.getAllTagsWithUsage();
});

const refreshTagConsumers = async () => {
	await getManagedTags().refresh();
	await getAvailableTags().refresh();
	await getRecipesMetadata().refresh();
};

export const createTag = form(
	z.object({ name: nameSchema, category: categorySchema }),
	async ({ name, category }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		await tagService.createTag({ name, category });
		await refreshTagConsumers();
	}
);

export const updateTag = form(
	z.object({ tagId: tagIdSchema, name: nameSchema, category: categorySchema }),
	async ({ tagId, name, category }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		await tagService.updateTag(tagId, { name, category });
		await refreshTagConsumers();
	}
);

export const deleteTag = form(z.object({ tagId: tagIdSchema }), async ({ tagId }) => {
	if (!userCanWrite()) {
		throwNewPermissionError();
	}

	await tagService.deleteTag(tagId);
	await refreshTagConsumers();
});
