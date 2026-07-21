import { isHttpError } from '@sveltejs/kit';

const GENERIC_ERROR = 'An unexpected error occurred while handling the request.';

/** Wraps structured output in the text block non-structured clients read. */
export const toolResult = <T extends object>(structuredContent: T) => ({
	structuredContent,
	content: [{ type: 'text' as const, text: JSON.stringify(structuredContent, null, 2) }]
});

/**
 * Maps a thrown service error to an MCP tool result. Client-side failures (4xx `HttpError`, e.g. an
 * unknown slug) keep their message so the model can recover; anything else is logged and replaced
 * with a generic message to avoid leaking internals over a public endpoint.
 */
export function toToolError(err: unknown) {
	if (isHttpError(err) && err.status < 500) {
		return { isError: true as const, content: [{ type: 'text' as const, text: err.body.message }] };
	}

	console.error('MCP tool error:', err);
	return { isError: true as const, content: [{ type: 'text' as const, text: GENERIC_ERROR }] };
}
