import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const recipe = await db
			.insert(recipes)
			.values({
				name: formData.get('name') as string,
				description: formData.get('description') as string
			})
			.returning();

		return redirect(302, `/${recipe[0].id}`);
	}
};
