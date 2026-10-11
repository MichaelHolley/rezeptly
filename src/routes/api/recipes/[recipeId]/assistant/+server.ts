import { recipeIdSchema } from '#lib/api/schemas.js';
import { aiEnabled, streamRecipeAssistant } from '#lib/server/services/ai.service.js';
import * as recipeService from '#lib/server/services/recipe.service.js';
import { error, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

const requestSchema = z.object({ messages: z.array(z.unknown()).min(1).max(30) });

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.roles?.includes('admin')) {
		error(403, 'You cannot use the recipe assistant.', { code: 'PERMISSION_DENIED' });
	}
	if (!aiEnabled()) {
		error(404, 'Recipe assistant is not available.', { code: 'NOT_FOUND' });
	}

	const recipeId = recipeIdSchema.safeParse(params.recipeId);
	if (!recipeId.success) error(400, 'Invalid recipe.', { code: 'VALIDATION_ERROR' });

	const rawBody = await request.text();
	if (rawBody.length > 64_000) {
		return Response.json({ message: 'The conversation is too long.' }, { status: 413 });
	}

	let body: unknown;
	try {
		body = JSON.parse(rawBody);
	} catch {
		error(400, 'Invalid request.', { code: 'VALIDATION_ERROR' });
	}

	const parsed = requestSchema.safeParse(body);
	if (!parsed.success) error(400, 'Invalid request.', { code: 'VALIDATION_ERROR' });

	const recipe = await recipeService.getRecipeById(recipeId.data, { includeDrafts: true });

	return streamRecipeAssistant(recipe, parsed.data.messages);
};
