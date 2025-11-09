import { AUTH_PASSWORD } from '$env/static/private';
import { generateSessionToken, setSessionTokenCookie } from '$lib/server/auth/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password') as string;

		if (password !== AUTH_PASSWORD) {
			return fail(401, { message: 'Incorrect password' });
		}

		const { token, expires } = generateSessionToken();
		setSessionTokenCookie(event, token, expires);

		return redirect(303, `/`);
	}
};
