import type { HandleClientError } from '@sveltejs/kit/hooks';

export const handleError: HandleClientError = ({ kind, error }) => {
	if (kind === 'app') return error;

	console.error(error);
	return { message: 'Something went wrong', code: 'UNHANDLED_ERROR' };
};
