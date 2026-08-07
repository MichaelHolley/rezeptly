import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { userCanWrite } from '$lib/server/auth/permissions';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	if (!userCanWrite()) {
		redirect(307, '/auth');
	}

	if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL_NAME) {
		error(404, { message: 'Recipe import is not configured on this instance.', code: 'NOT_FOUND' });
	}

	return {};
};
