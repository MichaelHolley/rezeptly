import { command } from '$app/server';
import { deleteRecipe } from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const deleteRecipeById = command(z.number(), async (id) => {
	if (!id || isNaN(Number(id))) {
		return fail(400);
	}

	await deleteRecipe(id);
});
