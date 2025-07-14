import { eq } from 'drizzle-orm';
import { db } from '../db';
import { instructions } from '../db/schema';
import type { Instruction, NewInstruction } from '../types';

export const getInstructions = async (recipeId: number): Promise<Instruction[]> => {
	return await db.query.instructions.findMany({
		where: eq(instructions.recipeId, recipeId)
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
	const result = await db.update(instructions).set(data).where(eq(instructions.id, id)).returning();
	return result[0];
};

export const deleteInstruction = async (id: number): Promise<void> => {
	await db.delete(instructions).where(eq(instructions.id, id));
};
