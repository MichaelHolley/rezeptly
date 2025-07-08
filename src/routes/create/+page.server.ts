import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const targeted = Number.parseInt(formData.get('targetedPersons') as string);

		const recipe = await db
			.insert(recipes)
			.values({
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				targetedPersons: targeted
			})
			.returning();

		return redirect(302, `/${recipe[0].id}`);
	}
};
