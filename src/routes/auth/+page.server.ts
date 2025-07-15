import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		auth.setSessionTokenCookie(event, 'test', new Date(Date.now() + auth.DAY_IN_MS * 10));

		return redirect(302, `/}`);
	}
};
