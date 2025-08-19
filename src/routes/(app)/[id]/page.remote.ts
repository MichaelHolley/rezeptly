import { command } from '$app/server';
import * as recipeService from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const deleteRecipe = command(z.number(), async (id) => {
	if (!id || isNaN(Number(id))) {
		return fail(400);
	}

	await recipeService.deleteRecipe(id);
});
