import { isHttpError } from '@sveltejs/kit';

export type ToolErrorResult = {
	isError: true;
	content: { type: 'text'; text: string }[];
};

const GENERIC_MESSAGE = 'An unexpected error occurred while handling the request.';

/**
 * Maps a thrown service error to an MCP tool result. Client-side failures (4xx `HttpError`, e.g. an
 * unknown slug) keep their message so the model can recover; anything else is logged and replaced
 * with a generic message to avoid leaking internals over a public endpoint.
 */
export function toToolError(err: unknown): ToolErrorResult {
	const text = isHttpError(err) && err.status < 500 ? err.body.message : GENERIC_MESSAGE;

	if (!isHttpError(err) || err.status >= 500) {
		console.error('MCP tool error:', err);
	}

	return { isError: true, content: [{ type: 'text', text }] };
}
