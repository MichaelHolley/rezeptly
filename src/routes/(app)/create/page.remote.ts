import { form } from '$app/server';
import * as recipeService from '$lib/server/services';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const createRecipe = form(
	z.object({
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional()
	}),
	async ({ name, description, tags }) => {
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
