import { upsertInstructionsForRecipe } from '$lib/server/services';
import type { NewInstruction } from '$lib/server/types.js';
import { fail } from '@sveltejs/kit';

export const actions = {
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
	}
};
