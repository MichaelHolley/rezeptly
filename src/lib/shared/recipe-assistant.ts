import { COURSES } from '$lib/shared/course';
import type { UIMessage } from 'ai';
import { z } from 'zod';

const nullableTextSchema = z.string().trim().min(1).nullable();

export const assistantDetailsStateSchema = z.object({
	name: z.string().trim().min(1).describe('The name of the recipe'),
	description: nullableTextSchema.describe(
		'A short summary of the dish, or null only when the writer asked to clear it'
	),
	course: z
		.enum(COURSES)
		.nullable()
		.describe('The position of the dish in a meal, or null only when the writer asked to clear it'),
	durationMinutes: z
		.int()
		.nonnegative()
		.nullable()
		.describe('Total time needed in minutes, or null only when the writer asked to clear it'),
	portions: z
		.int()
		.min(1)
		.max(99)
		.nullable()
		.describe('Number of portions, or null only when the writer asked to clear it')
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
		.describe(
			'One entry per detail the writer explicitly asked to change. Omit every detail that stays the same rather than repeating its current value.'
		)
});

export const assistantIngredientProposalSchema = z.object({
	expected: z
		.array(z.string().trim().min(1))
		.describe('An exact copy of the complete current ingredient list, in its current order'),
	replacement: z
		.array(z.string().trim().min(1))
		.describe('The complete desired ingredient list, including every unchanged ingredient')
});

export const assistantInstructionSchema = z.object({
	heading: nullableTextSchema.describe('The heading of this step, or null when it has none'),
	instructions: z.string().trim().min(1).describe('The text of this step')
});

export const assistantInstructionProposalSchema = z.object({
	expected: z
		.array(assistantInstructionSchema)
		.describe('An exact copy of the complete current instruction list, in its current order'),
	replacement: z
		.array(assistantInstructionSchema)
		.describe('The complete desired instruction list, including every unchanged step')
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

export function listProposalIsStale<T>(current: T[], expected: T[]): boolean {
	return JSON.stringify(current) !== JSON.stringify(expected);
}
