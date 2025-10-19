import { form } from '$app/server';
import { userCanWrite } from '$lib/server/auth';
import * as recipeService from '$lib/server/services';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const createRecipe = form(
	z.object({
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional()
	}),
	async ({ name, description, tags }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			ingredients: [],
			instructions: [],
			tags: tags?.map((tag) => ({ name: tag.trim() })) ?? []
		});

		redirect(303, `/${recipe.id}`);
	}
);
