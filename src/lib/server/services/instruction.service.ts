import { eq } from 'drizzle-orm';
import { db } from '../db';
import { instructions } from '../db/schema';
import type { Instruction, NewInstruction } from '../types';

export const getInstructionById = async (id: number): Promise<Instruction | undefined> => {
	return await db.query.instructions.findFirst({
		where: eq(instructions.id, id)
	});
};

export const upsertInstructionsForRecipe = async (
	recipeId: number,
	newInstructions: NewInstruction[]
): Promise<void> => {
	await db.transaction(async (tx) => {
		await tx.delete(instructions).where(eq(instructions.recipeId, recipeId));

		if (newInstructions.length > 0) {
			const instructionsToInsert = newInstructions.map((instruction) => ({
				...instruction,
				recipeId
			}));
			await tx.insert(instructions).values(instructionsToInsert);
		}
	});
};
