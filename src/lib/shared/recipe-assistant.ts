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

export const assistantDetailsProposalSchema = assistantDetailsStateSchema
	.partial()
	.refine((changes) => Object.keys(changes).length > 0, 'At least one detail must change');

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
