import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error }) => {
	console.error(error);
	return { message: 'Something went wrong', code: 'UNHANDLED_ERROR' };
};
