import { eq } from 'drizzle-orm';
import { db } from '../db';
import { instructions } from '../db/schema';
import { NotFoundError } from '../errors';
import type { Instruction, NewInstruction } from '../types';

export const getInstructions = async (recipeId: number): Promise<Instruction[]> => {
	return await db.query.instructions.findMany({
		where: eq(instructions.recipeId, recipeId)
	});
};

export const getInstructionById = async (id: number): Promise<Instruction | undefined> => {
	return await db.query.instructions.findFirst({
		where: eq(instructions.id, id)
	});
};

export const createInstruction = async (data: NewInstruction): Promise<Instruction> => {
	const result = await db.insert(instructions).values(data).returning();
	return result[0];
};

export const updateInstruction = async (
	id: number,
	data: Partial<NewInstruction>
): Promise<Instruction> => {
	const existing = await getInstructionById(id);
	if (!existing) {
		throw new NotFoundError('Instruction', id);
	}

	const result = await db.update(instructions).set(data).where(eq(instructions.id, id)).returning();
	return result[0];
};

export const deleteInstruction = async (id: number): Promise<void> => {
	const existing = await getInstructionById(id);
	if (!existing) {
		throw new NotFoundError('Instruction', id);
	}

	await db.delete(instructions).where(eq(instructions.id, id));
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
