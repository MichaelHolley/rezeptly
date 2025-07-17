import {
	createIngredient,
	deleteIngredient,
	upsertInstructionsForRecipe
} from '$lib/server/services';
import { deleteRecipe, getRecipeById, updateRecipe } from '$lib/server/services/recipe.service';
import type { NewInstruction } from '$lib/server/types.js';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		redirect(302, '/');
	}

	const recipe = await getRecipeById(Number(id));

	if (!recipe) {
		redirect(302, '/');
	}

	return { recipe };
};

export const actions = {
	delete: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return fail(400);
		}

		await deleteRecipe(Number(id));

		return redirect(302, '/');
	},
	addIngredient: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return fail(400);
		}

		const formData = await event.request.formData();
		const name = formData.get('name') as string;

		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		await createIngredient({
			name: name,
			recipeId: Number(id)
		});

		return { status: 200 };
	},
	deleteIngredient: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return fail(400);
		}

		const formData = await event.request.formData();
		const ingrId = formData.get('id') as string;

		if (!ingrId) {
			return fail(400);
		}

		await deleteIngredient(Number(ingrId));

		return { status: 200 };
	},
	updateInstructions: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return fail(400);
		}

		const formData = await event.request.formData();

		const orderNumbers = new Set(
			Array.from(formData.keys())
				.map((key) => key.split('_'))
				.map((k) => k[0])
		);

		const instructionItems: NewInstruction[] = [];

		for (const key of orderNumbers) {
			const heading = formData.get(`${key}_heading`) as string;
			const instructions = formData.get(`${key}_instructions`) as string;

			instructionItems.push({
				heading,
				instructions,
				stepOrder: Number(key),
				recipeId: Number(id)
			});
		}

		await upsertInstructionsForRecipe(Number(id), instructionItems);

		return { status: 200 };
	},
	updateDetails: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return fail(400);
		}

		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		await updateRecipe(Number(id), { name, description });

		return { status: 200 };
	}
};
