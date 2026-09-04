import { recipeIdSchema } from '$lib/api/schemas';
import { aiEnabled, streamRecipeAssistant } from '$lib/server/services/ai.service';
import * as recipeService from '$lib/server/services/recipe.service';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

const requestSchema = z.object({ messages: z.array(z.unknown()).min(1).max(30) });

function textLength(value: unknown): number {
	if (typeof value === 'string') return value.length;
	if (Array.isArray(value)) return value.reduce((total, item) => total + textLength(item), 0);
	if (value && typeof value === 'object') {
		return Object.entries(value).reduce((total, [key, item]) => {
			if (key === 'text' && typeof item === 'string') return total + item.length;
			if (typeof item === 'object') return total + textLength(item);
			return total;
		}, 0);
	}
	return 0;
}

function hasApprovalResponse(value: unknown): boolean {
	if (Array.isArray(value)) return value.some(hasApprovalResponse);
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return record.state === 'approval-responded' || Object.values(record).some(hasApprovalResponse);
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.roles?.includes('admin')) {
		error(403, { message: 'You cannot use the recipe assistant.', code: 'PERMISSION_DENIED' });
	}
	if (!aiEnabled()) {
		error(404, { message: 'Recipe assistant is not available.', code: 'NOT_FOUND' });
	}

	const recipeId = recipeIdSchema.safeParse(params.recipeId);
	if (!recipeId.success) error(400, { message: 'Invalid recipe.', code: 'VALIDATION_ERROR' });

	const rawBody = await request.text();
	if (rawBody.length > 64_000) {
		return json({ message: 'The conversation is too long.' }, { status: 413 });
	}

	let body: unknown;
	try {
		body = JSON.parse(rawBody);
	} catch {
		error(400, { message: 'Invalid request.', code: 'VALIDATION_ERROR' });
	}

	const parsed = requestSchema.safeParse(body);
	if (!parsed.success || textLength(parsed.data.messages) > 12_000) {
		return json({ message: 'The conversation is too long.' }, { status: 413 });
	}

	const recipe = await recipeService.getRecipeById(recipeId.data, { includeDrafts: true });
	if (recipe.publishedAt != null && !hasApprovalResponse(parsed.data.messages)) {
		error(404, {
			message: 'Recipe assistant is only available for drafts.',
			code: 'NOT_FOUND'
		});
	}

	return streamRecipeAssistant(recipe, parsed.data.messages);
};
