import { error } from '@sveltejs/kit';
import { and, asc, eq, gt, isNull, max, sql } from 'drizzle-orm';
import { db } from '../db';
import { ingredientSections, ingredients, recipes } from '../db/schema';
import type {
	Ingredient,
	IngredientId,
	IngredientSection,
	IngredientSectionId,
	RecipeId
} from '../types';
import { validateIngredientHierarchy } from './util/validate-ingredient-hierarchy';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type IngredientGroupNames = {
	heading: string | null;
	items: string[];
};

export type IngredientHierarchy = {
	ungroupedIngredientIds: IngredientId[];
	sections: {
		sectionId: IngredientSectionId;
		ingredientIds: IngredientId[];
	}[];
};

async function lockRecipe(tx: Tx, recipeId: RecipeId): Promise<void> {
	const rows = await tx.execute(sql`select id from ${recipes} where id = ${recipeId} for update`);
	if (rows.length === 0) {
		error(404, { message: `Recipe with ID ${recipeId} not found`, code: 'NOT_FOUND' });
	}
}

function hierarchyError(message: string): never {
	error(409, { message, code: 'VALIDATION_ERROR' });
}

function sectionCondition(sectionId: number | null) {
	return sectionId === null ? isNull(ingredients.sectionId) : eq(ingredients.sectionId, sectionId);
}

export const createIngredient = async (data: {
	name: string;
	recipeId: RecipeId;
	sectionId: IngredientSectionId | null;
}): Promise<Ingredient> => {
	return db.transaction(async (tx) => {
		await lockRecipe(tx, data.recipeId);

		if (data.sectionId !== null) {
			const [section] = await tx
				.select({ id: ingredientSections.id })
				.from(ingredientSections)
				.where(
					and(
						eq(ingredientSections.id, data.sectionId),
						eq(ingredientSections.recipeId, data.recipeId)
					)
				);
			if (!section) hierarchyError('The selected ingredient section no longer exists.');
		}

		const [position] = await tx
			.select({ value: max(ingredients.ingredientOrder) })
			.from(ingredients)
			.where(and(eq(ingredients.recipeId, data.recipeId), sectionCondition(data.sectionId)));

		const [created] = await tx
			.insert(ingredients)
			.values({ ...data, ingredientOrder: (position?.value ?? 0) + 1 })
			.returning();
		return created;
	});
};

export const updateIngredient = async (
	recipeId: RecipeId,
	id: IngredientId,
	name: string
): Promise<Ingredient> => {
	return db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		const [updated] = await tx
			.update(ingredients)
			.set({ name })
			.where(and(eq(ingredients.id, id), eq(ingredients.recipeId, recipeId)))
			.returning();
		if (!updated) hierarchyError('The ingredient no longer exists.');
		return updated;
	});
};

export const deleteIngredient = async (recipeId: RecipeId, id: IngredientId): Promise<void> => {
	await db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		const [ingredient] = await tx
			.select()
			.from(ingredients)
			.where(and(eq(ingredients.id, id), eq(ingredients.recipeId, recipeId)));
		if (!ingredient) hierarchyError('The ingredient no longer exists.');

		await tx.delete(ingredients).where(eq(ingredients.id, id));
		await tx
			.update(ingredients)
			.set({ ingredientOrder: sql`${ingredients.ingredientOrder} - 1` })
			.where(
				and(
					eq(ingredients.recipeId, recipeId),
					sectionCondition(ingredient.sectionId),
					gt(ingredients.ingredientOrder, ingredient.ingredientOrder)
				)
			);
	});
};

export const createIngredientSection = async (
	recipeId: RecipeId,
	name: string
): Promise<IngredientSection> => {
	return db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		const [position] = await tx
			.select({ value: max(ingredientSections.sectionOrder) })
			.from(ingredientSections)
			.where(eq(ingredientSections.recipeId, recipeId));
		const [created] = await tx
			.insert(ingredientSections)
			.values({ recipeId, name, sectionOrder: (position?.value ?? 0) + 1 })
			.returning();
		return created;
	});
};

export const renameIngredientSection = async (
	recipeId: RecipeId,
	sectionId: IngredientSectionId,
	name: string
): Promise<IngredientSection> => {
	return db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		const [updated] = await tx
			.update(ingredientSections)
			.set({ name })
			.where(and(eq(ingredientSections.id, sectionId), eq(ingredientSections.recipeId, recipeId)))
			.returning();
		if (!updated) hierarchyError('The ingredient section no longer exists.');
		return updated;
	});
};

export const deleteIngredientSection = async (
	recipeId: RecipeId,
	sectionId: IngredientSectionId
): Promise<void> => {
	await db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		const [section] = await tx
			.select()
			.from(ingredientSections)
			.where(and(eq(ingredientSections.id, sectionId), eq(ingredientSections.recipeId, recipeId)));
		if (!section) hierarchyError('The ingredient section no longer exists.');

		const [position] = await tx
			.select({ value: max(ingredients.ingredientOrder) })
			.from(ingredients)
			.where(and(eq(ingredients.recipeId, recipeId), isNull(ingredients.sectionId)));
		const grouped = await tx
			.select()
			.from(ingredients)
			.where(eq(ingredients.sectionId, sectionId))
			.orderBy(asc(ingredients.ingredientOrder));

		for (const [index, ingredient] of grouped.entries()) {
			await tx
				.update(ingredients)
				.set({ sectionId: null, ingredientOrder: (position?.value ?? 0) + index + 1 })
				.where(eq(ingredients.id, ingredient.id));
		}

		await tx.delete(ingredientSections).where(eq(ingredientSections.id, sectionId));
		await tx
			.update(ingredientSections)
			.set({ sectionOrder: sql`${ingredientSections.sectionOrder} - 1` })
			.where(
				and(
					eq(ingredientSections.recipeId, recipeId),
					gt(ingredientSections.sectionOrder, section.sectionOrder)
				)
			);
	});
};

export const reorderIngredientHierarchy = async (
	recipeId: RecipeId,
	hierarchy: IngredientHierarchy
): Promise<void> => {
	await db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		const currentSections = await tx
			.select({ id: ingredientSections.id })
			.from(ingredientSections)
			.where(eq(ingredientSections.recipeId, recipeId));
		const currentIngredients = await tx
			.select({ id: ingredients.id })
			.from(ingredients)
			.where(eq(ingredients.recipeId, recipeId));

		const invalidPart = validateIngredientHierarchy(
			currentSections.map(({ id }) => id),
			currentIngredients.map(({ id }) => id),
			hierarchy
		);
		if (invalidPart === 'sections') {
			hierarchyError('The ingredient sections changed. Refresh and try again.');
		}
		if (invalidPart === 'ingredients') {
			hierarchyError('The ingredients changed. Refresh and try again.');
		}

		for (const [index, section] of hierarchy.sections.entries()) {
			await tx
				.update(ingredientSections)
				.set({ sectionOrder: index + 1 })
				.where(eq(ingredientSections.id, section.sectionId));
		}

		const blocks = [
			{ sectionId: null, ingredientIds: hierarchy.ungroupedIngredientIds },
			...hierarchy.sections.map(({ sectionId, ingredientIds }) => ({
				sectionId,
				ingredientIds
			}))
		];
		for (const block of blocks) {
			for (const [index, ingredientId] of block.ingredientIds.entries()) {
				await tx
					.update(ingredients)
					.set({ sectionId: block.sectionId, ingredientOrder: index + 1 })
					.where(eq(ingredients.id, ingredientId));
			}
		}
	});
};

async function ingredientGroupState(tx: Tx, recipeId: RecipeId): Promise<IngredientGroupNames[]> {
	const ungrouped = await tx
		.select({ name: ingredients.name })
		.from(ingredients)
		.where(and(eq(ingredients.recipeId, recipeId), isNull(ingredients.sectionId)))
		.orderBy(asc(ingredients.ingredientOrder));
	const sections = await tx.query.ingredientSections.findMany({
		where: eq(ingredientSections.recipeId, recipeId),
		orderBy: (section, { asc }) => [asc(section.sectionOrder)],
		with: { ingredients: { orderBy: (ingredient, { asc }) => [asc(ingredient.ingredientOrder)] } }
	});
	return [
		{ heading: null, items: ungrouped.map(({ name }) => name) },
		...sections.map((section) => ({
			heading: section.name,
			items: section.ingredients.map(({ name }) => name)
		}))
	];
}

export const replaceIngredientsForRecipe = async (
	recipeId: RecipeId,
	expected: IngredientGroupNames[],
	replacement: IngredientGroupNames[]
): Promise<boolean> => {
	return db.transaction(async (tx) => {
		await lockRecipe(tx, recipeId);
		if (JSON.stringify(await ingredientGroupState(tx, recipeId)) !== JSON.stringify(expected)) {
			return false;
		}

		await tx.delete(ingredients).where(eq(ingredients.recipeId, recipeId));
		await tx.delete(ingredientSections).where(eq(ingredientSections.recipeId, recipeId));

		let sectionOrder = 0;
		for (const group of replacement) {
			let sectionId: number | null = null;
			if (group.heading !== null) {
				sectionOrder += 1;
				const [section] = await tx
					.insert(ingredientSections)
					.values({ recipeId, name: group.heading, sectionOrder })
					.returning({ id: ingredientSections.id });
				sectionId = section.id;
			}

			if (group.items.length > 0) {
				await tx.insert(ingredients).values(
					group.items.map((name, index) => ({
						name,
						recipeId,
						sectionId,
						ingredientOrder: index + 1
					}))
				);
			}
		}
		return true;
	});
};
