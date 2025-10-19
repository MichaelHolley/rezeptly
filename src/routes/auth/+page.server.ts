import { ADMIN_AUTH_PASSWORD, AUTH_PASSWORD } from '$env/static/private';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password') as string;

		const isAdmin = password === ADMIN_AUTH_PASSWORD;

		if (password !== AUTH_PASSWORD && !isAdmin) {
			return fail(401, { message: 'Incorrect password' });
		}

		const { token, expires } = auth.generateSessionToken(isAdmin);
		auth.setSessionTokenCookie(event, token, expires);

		return redirect(303, `/`);
	}
};
