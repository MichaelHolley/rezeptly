import { error } from '@sveltejs/kit';
import { and, count, eq, ilike, inArray, like, ne, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { ingredients, instructions, recipes, recipesToTags, tags } from '../db/schema';
import type {
	NewIngredient,
	NewInstruction,
	NewRecipe,
	Recipe,
	RecipeId,
	RecipeMetadata,
	RecipeWithDetails,
	Tag,
	TagInput
} from '../types';
import { deleteImage } from './image.service';
import { upsertTags } from './tag.service';
import { generateSlug } from './util/generate-slug';
import { recipeVisibility, type ReadOptions } from './util/recipe-visibility';

export type { ReadOptions };

const flattenTags = <T extends { tags: { tag: Tag }[] }>(row: T) => ({
	...row,
	tags: row.tags.map((rt) => rt.tag)
});

export type RecipeFilter = {
	search?: string;
	tags?: string[];
};

/** Escapes ILIKE wildcards so a user-supplied term matches literally. */
const escapeLike = (term: string) => term.replace(/[\\%_]/g, '\\$&');

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Appends `-2`, `-3`, … until the slug is free. `excludeId` keeps a recipe from colliding with itself. */
const resolveUniqueSlug = async (tx: Tx, base: string, excludeId?: RecipeId): Promise<string> => {
	const taken = await tx
		.select({ slug: recipes.slug })
		.from(recipes)
		.where(
			and(
				or(eq(recipes.slug, base), like(recipes.slug, `${base}-%`)),
				excludeId === undefined ? undefined : ne(recipes.id, excludeId)
			)
		);

	const slugs = new Set(taken.map((row) => row.slug));
	if (!slugs.has(base)) return base;

	let suffix = 2;
	while (slugs.has(`${base}-${suffix}`)) suffix++;

	return `${base}-${suffix}`;
};

const buildRecipeWhere = (filter?: RecipeFilter, options?: ReadOptions): SQL | undefined => {
	const conditions: SQL[] = [];

	const visibility = recipeVisibility(options);
	if (visibility) {
		conditions.push(visibility);
	}

	const search = filter?.search?.trim();
	if (search) {
		const pattern = `%${escapeLike(search)}%`;
		conditions.push(or(ilike(recipes.name, pattern), ilike(recipes.description, pattern))!);
	}

	if (filter?.tags?.length) {
		const matchingIds = db
			.select({ recipeId: recipesToTags.recipeId })
			.from(recipesToTags)
			.innerJoin(tags, eq(recipesToTags.tagId, tags.id))
			.where(inArray(tags.slug, filter.tags))
			.groupBy(recipesToTags.recipeId)
			.having(sql`count(distinct ${tags.slug}) = ${filter.tags.length}`);

		conditions.push(inArray(recipes.id, matchingIds));
	}

	return conditions.length ? and(...conditions) : undefined;
};

export const getRecipesMetadata = async (
	filter?: RecipeFilter,
	page?: { limit: number; offset: number },
	options?: ReadOptions
): Promise<RecipeMetadata[]> => {
	const result = await db.query.recipes.findMany({
		where: buildRecipeWhere(filter, options),
		with: { tags: { with: { tag: true } } },
		orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
		...page
	});

	return result.map(flattenTags);
};

export const countRecipes = async (
	filter?: RecipeFilter,
	options?: ReadOptions
): Promise<number> => {
	const [totals] = await db
		.select({ value: count() })
		.from(recipes)
		.where(buildRecipeWhere(filter, options));
	return totals?.value ?? 0;
};

export const getRecipeById = async (
	id: RecipeId,
	options?: ReadOptions
): Promise<RecipeWithDetails> => {
	const result = await db.query.recipes.findFirst({
		where: and(eq(recipes.id, id), recipeVisibility(options)),
		with: {
			ingredients: true,
			instructions: { orderBy: (i, { asc }) => [asc(i.stepOrder)] },
			tags: { with: { tag: true } }
		}
	});

	if (!result) {
		error(404, { message: `Recipe with ID ${id} not found`, code: 'NOT_FOUND' });
	}

	return flattenTags(result);
};

export const getRecipeBySlug = async (
	slug: string,
	options?: ReadOptions
): Promise<RecipeWithDetails> => {
	const result = await db.query.recipes.findFirst({
		where: and(eq(recipes.slug, slug), recipeVisibility(options)),
		with: {
			ingredients: true,
			instructions: { orderBy: (i, { asc }) => [asc(i.stepOrder)] },
			tags: { with: { tag: true } }
		}
	});

	if (!result) {
		error(404, { message: `Recipe with slug ${slug} not found`, code: 'NOT_FOUND' });
	}

	return flattenTags(result);
};

export const createRecipe = async (
	data: Omit<NewRecipe, 'id' | 'slug' | 'createdAt'> & {
		ingredients: Omit<NewIngredient, 'recipeId'>[];
		instructions: Omit<NewInstruction, 'recipeId'>[];
		tags: TagInput[];
	}
): Promise<Recipe> => {
	const newRecipe = await db.transaction(async (tx) => {
		const baseSlug = generateSlug(data.name);

		if (!baseSlug) {
			error(400, {
				message: 'Generated slug is empty. Please provide a valid name for the recipe.',
				code: 'VALIDATION_ERROR'
			});
		}

		const slug = await resolveUniqueSlug(tx, baseSlug);

		const [createdRecipe] = await tx
			.insert(recipes)
			.values({
				name: data.name,
				slug,
				description: data.description,
				imageUrl: data.imageUrl,
				course: data.course,
				durationMinutes: data.durationMinutes,
				portions: data.portions
			})
			.returning();

		if (data.ingredients && data.ingredients.length > 0) {
			const newIngredients = data.ingredients.map((ingredient) => ({
				...ingredient,
				recipeId: createdRecipe.id
			}));

			await tx.insert(ingredients).values(newIngredients);
		}

		if (data.instructions && data.instructions.length > 0) {
			const newInstructions = data.instructions.map((instruction) => ({
				...instruction,
				recipeId: createdRecipe.id
			}));

			await tx.insert(instructions).values(newInstructions);
		}

		if (data.tags && data.tags.length > 0) {
			const resolvedTags = await upsertTags(tx, data.tags);

			if (resolvedTags.length > 0) {
				await tx.insert(recipesToTags).values(
					resolvedTags.map((tag) => ({
						recipeId: createdRecipe.id,
						tagId: tag.id
					}))
				);
			}
		}

		return createdRecipe;
	});

	return newRecipe;
};

export const updateRecipe = async (
	id: RecipeId,
	data: Partial<NewRecipe> & { tags?: TagInput[] }
): Promise<Recipe> => {
	const updatedRecipe = await db.transaction(async (tx) => {
		const [currentRecipe] = await tx.select().from(recipes).where(eq(recipes.id, id));

		if (!currentRecipe) {
			error(404, { message: `Recipe with ID ${id} not found`, code: 'NOT_FOUND' });
		}

		const baseSlug = data.name ? generateSlug(data.name) : currentRecipe.slug;
		if (!baseSlug) {
			error(400, {
				message: 'Generated slug is empty. Please provide a valid name for the recipe.',
				code: 'VALIDATION_ERROR'
			});
		}

		const slug = data.name ? await resolveUniqueSlug(tx, baseSlug, id) : baseSlug;

		const [updatedRecipe] = await tx
			.update(recipes)
			.set({
				name: data.name,
				slug,
				description: data.description,
				imageUrl: data.imageUrl,
				course: data.course,
				durationMinutes: data.durationMinutes,
				portions: data.portions
			})
			.where(eq(recipes.id, id))
			.returning();

		// Delete old image if it's being replaced
		if (currentRecipe?.imageUrl && data.imageUrl && currentRecipe.imageUrl !== data.imageUrl) {
			await deleteImage(currentRecipe.imageUrl);
		}

		// Only update tags if explicitly provided
		if (data.tags !== undefined) {
			await tx.delete(recipesToTags).where(eq(recipesToTags.recipeId, updatedRecipe.id));

			if (data.tags.length > 0) {
				const resolvedTags = await upsertTags(tx, data.tags);

				if (resolvedTags.length > 0) {
					await tx.insert(recipesToTags).values(
						resolvedTags.map((tag) => ({
							recipeId: updatedRecipe.id,
							tagId: tag.id
						}))
					);
				}
			}
		}

		return updatedRecipe;
	});

	return updatedRecipe;
};

export const setRecipePublished = async (id: RecipeId, published: boolean): Promise<Recipe> => {
	const [updatedRecipe] = await db
		.update(recipes)
		.set({ publishedAt: published ? new Date() : null })
		.where(eq(recipes.id, id))
		.returning();

	if (!updatedRecipe) {
		error(404, { message: `Recipe with ID ${id} not found`, code: 'NOT_FOUND' });
	}

	return updatedRecipe;
};

export const deleteRecipe = async (id: RecipeId): Promise<void> => {
	// Get recipe to find image URL before deletion (getRecipeById throws if not found)
	const recipe = await getRecipeById(id, { includeDrafts: true });

	await db.delete(recipes).where(eq(recipes.id, id));

	// Delete associated image from Vercel Blob
	if (recipe.imageUrl) {
		await deleteImage(recipe.imageUrl);
	}
};
