import { COURSES } from '$lib/shared/course';
import type { UIMessage } from 'ai';
import { z } from 'zod';

const nullableTextSchema = z.string().trim().min(1).nullable();

export const assistantDetailsStateSchema = z.object({
	name: z.string().trim().min(1),
	description: nullableTextSchema,
	course: z.enum(COURSES).nullable(),
	durationMinutes: z.int().nonnegative().nullable(),
	portions: z.int().min(1).max(99).nullable()
});

const assistantDetailChangeSchema = z.discriminatedUnion('field', [
	z.object({ field: z.literal('name'), value: assistantDetailsStateSchema.shape.name }),
	z.object({
		field: z.literal('description'),
		value: assistantDetailsStateSchema.shape.description
	}),
	z.object({ field: z.literal('course'), value: assistantDetailsStateSchema.shape.course }),
	z.object({
		field: z.literal('durationMinutes'),
		value: assistantDetailsStateSchema.shape.durationMinutes
	}),
	z.object({ field: z.literal('portions'), value: assistantDetailsStateSchema.shape.portions })
]);

export const assistantDetailsProposalSchema = z.object({
	changes: z
		.array(assistantDetailChangeSchema)
		.min(1)
		.max(5)
		.refine(
			(changes) => new Set(changes.map(({ field }) => field)).size === changes.length,
			'Each detail may only be changed once'
		)
});

export const assistantIngredientProposalSchema = z.object({
	expected: z.array(z.string().trim().min(1)),
	replacement: z.array(z.string().trim().min(1))
});

export const assistantInstructionSchema = z.object({
	heading: nullableTextSchema,
	instructions: z.string().trim().min(1)
});

export const assistantInstructionProposalSchema = z.object({
	expected: z.array(assistantInstructionSchema),
	replacement: z.array(assistantInstructionSchema)
});

export type AssistantDetailsState = z.infer<typeof assistantDetailsStateSchema>;
export type AssistantDetailChange = z.infer<typeof assistantDetailChangeSchema>;
export type AssistantDetailsProposal = z.infer<typeof assistantDetailsProposalSchema>;
export type AssistantIngredientProposal = z.infer<typeof assistantIngredientProposalSchema>;
export type AssistantInstruction = z.infer<typeof assistantInstructionSchema>;
export type AssistantInstructionProposal = z.infer<typeof assistantInstructionProposalSchema>;

export type AssistantToolResult =
	| { status: 'applied'; recipe: { id: number; slug: string } }
	| { status: 'stale' | 'unavailable' | 'failed'; message: string };

export type RecipeAssistantTools = {
	updateDetails: { input: AssistantDetailsProposal; output: AssistantToolResult };
	replaceIngredients: { input: AssistantIngredientProposal; output: AssistantToolResult };
	replaceInstructions: { input: AssistantInstructionProposal; output: AssistantToolResult };
};

export type RecipeAssistantMessage = UIMessage<
	unknown,
	Record<string, unknown>,
	RecipeAssistantTools
>;

export function diffLists<T>(expected: T[], replacement: T[]) {
	const expectedKeys = expected.map((value) => JSON.stringify(value));
	const replacementKeys = replacement.map((value) => JSON.stringify(value));
	const lengths = Array.from({ length: expected.length + 1 }, () =>
		Array<number>(replacement.length + 1).fill(0)
	);

	for (let i = expected.length - 1; i >= 0; i--) {
		for (let j = replacement.length - 1; j >= 0; j--) {
			lengths[i][j] =
				expectedKeys[i] === replacementKeys[j]
					? lengths[i + 1][j + 1] + 1
					: Math.max(lengths[i + 1][j], lengths[i][j + 1]);
		}
	}

	const diff: { value: T; kind: 'unchanged' | 'removed' | 'added' }[] = [];
	let i = 0;
	let j = 0;
	while (i < expected.length && j < replacement.length) {
		if (expectedKeys[i] === replacementKeys[j]) {
			diff.push({ value: expected[i++], kind: 'unchanged' });
			j++;
		} else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
			diff.push({ value: expected[i++], kind: 'removed' });
		} else {
			diff.push({ value: replacement[j++], kind: 'added' });
		}
	}
	while (i < expected.length) diff.push({ value: expected[i++], kind: 'removed' });
	while (j < replacement.length) diff.push({ value: replacement[j++], kind: 'added' });

	return diff;
}

export function listProposalIsStale<T>(current: T[], expected: T[]): boolean {
	return JSON.stringify(current) !== JSON.stringify(expected);
}
