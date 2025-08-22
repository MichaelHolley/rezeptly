import { query } from '$app/server';
import * as recipeService from '$lib/server/services';

export const getRecipes = query(async () => {
	return await recipeService.getRecipes();
});
