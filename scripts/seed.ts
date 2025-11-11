import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
	recipes,
	ingredients,
	instructions,
	recipesToTags,
	tags
} from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import { config } from 'dotenv';

// Load environment variables
config();

// Setup database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, {
	schema: { recipes, ingredients, instructions, recipesToTags, tags }
});

async function deleteAllRecipes() {
	// Get all recipes
	const allRecipes = await db.select({ id: recipes.id }).from(recipes);

	// Delete all recipes (cascade will handle related records)
	for (const recipe of allRecipes) {
		await db.delete(recipes).where(eq(recipes.id, recipe.id));
	}

	return allRecipes.length;
}

async function seed(options: { force?: boolean } = {}) {
	console.log('🌱 Starting database seed...');

	try {
		// Check if already seeded
		const existingRecipes = await db.select().from(recipes);
		if (existingRecipes.length > 0) {
			console.log('⚠️  Database already contains recipes.');
			console.log(`   Found ${existingRecipes.length} existing recipe(s).`);

			// If force option not set and running interactively, ask for confirmation
			if (!options.force && process.stdin.isTTY) {
				const rl = readline.createInterface({ input, output });
				const answer = await rl.question('\n❓ Delete all existing recipes and reseed? (yes/no): ');
				rl.close();

				if (answer.toLowerCase() !== 'yes') {
					console.log('⏭️  Skipping seed. Database unchanged.');
					await client.end();
					return;
				}

				console.log('🗑️  Deleting existing recipes...');
				const count = await deleteAllRecipes();
				console.log(`   Deleted ${count} recipe(s).`);
			} else if (!options.force) {
				// Non-interactive mode without force flag - skip
				console.log('⏭️  Skipping seed. Use --force flag to delete and reseed.');
				await client.end();
				return;
			} else {
				// Force flag set - delete without asking
				console.log('🗑️  Force flag set. Deleting existing recipes...');
				const count = await deleteAllRecipes();
				console.log(`   Deleted ${count} recipe(s).`);
			}
		}

		console.log('Creating sample recipes...');

		// Helper function to create recipe with ingredients, instructions, and tags
		async function createRecipe(data: {
			name: string;
			description: string;
			ingredients: Array<{ name: string }>;
			instructions: Array<{ stepOrder: number; instructions: string }>;
			tags: Array<{ name: string }>;
		}) {
			// Create the recipe
			const [recipe] = await db
				.insert(recipes)
				.values({
					name: data.name,
					description: data.description
				})
				.returning();

			// Create ingredients
			if (data.ingredients.length > 0) {
				await db.insert(ingredients).values(
					data.ingredients.map((ing) => ({
						recipeId: recipe.id,
						name: ing.name
					}))
				);
			}

			// Create instructions
			if (data.instructions.length > 0) {
				await db.insert(instructions).values(
					data.instructions.map((inst) => ({
						recipeId: recipe.id,
						stepOrder: inst.stepOrder,
						instructions: inst.instructions
					}))
				);
			}

			// Create tags (handle duplicates)
			if (data.tags.length > 0) {
				for (const tagData of data.tags) {
					// Check if tag exists
					let [tag] = await db.select().from(tags).where(eq(tags.name, tagData.name));

					// Create tag if it doesn't exist
					if (!tag) {
						[tag] = await db.insert(tags).values({ name: tagData.name }).returning();
					}

					// Link tag to recipe
					await db.insert(recipesToTags).values({
						recipeId: recipe.id,
						tagId: tag.id
					});
				}
			}

			return recipe;
		}

		// Italian Recipes
		await createRecipe({
			name: 'Spaghetti Carbonara',
			description:
				'A classic Roman pasta dish with eggs, cheese, pancetta, and black pepper. Simple yet incredibly flavorful.',
			ingredients: [
				{ name: '400g Spaghetti' },
				{ name: '200g Pancetta, diced' },
				{ name: '4 large Eggs' },
				{ name: '100g Pecorino Romano cheese, grated' },
				{ name: '1 tsp Black pepper, freshly ground' },
				{ name: 'Salt to taste' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions: 'Bring a large pot of salted water to boil for the pasta.'
				},
				{
					stepOrder: 2,
					instructions:
						'Cook pancetta in a large pan over medium heat until crispy, about 5 minutes.'
				},
				{
					stepOrder: 3,
					instructions: 'In a bowl, whisk together eggs, grated cheese, and black pepper.'
				},
				{
					stepOrder: 4,
					instructions: 'Cook spaghetti according to package directions until al dente.'
				},
				{
					stepOrder: 5,
					instructions: 'Reserve 1 cup pasta water, then drain pasta and add to pan with pancetta.'
				},
				{
					stepOrder: 6,
					instructions:
						'Remove from heat and quickly stir in egg mixture, adding pasta water to create a creamy sauce.'
				},
				{
					stepOrder: 7,
					instructions: 'Serve immediately with extra cheese and black pepper.'
				}
			],
			tags: [{ name: 'Italian' }, { name: 'Pasta' }, { name: 'Quick' }, { name: 'Dinner' }]
		});

		await createRecipe({
			name: 'Margherita Pizza',
			description:
				'The quintessential Italian pizza with tomato sauce, fresh mozzarella, and basil. Simple ingredients, perfect flavor.',
			ingredients: [
				{ name: '500g Pizza dough' },
				{ name: '400g San Marzano tomatoes, crushed' },
				{ name: '250g Fresh mozzarella, sliced' },
				{ name: '10-12 Fresh basil leaves' },
				{ name: '2 tbsp Extra virgin olive oil' },
				{ name: '2 cloves Garlic, minced' },
				{ name: 'Salt to taste' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions:
						'Preheat oven to highest setting (250°C/480°F) with pizza stone if available.'
				},
				{
					stepOrder: 2,
					instructions: 'Mix crushed tomatoes with olive oil, garlic, and salt for the sauce.'
				},
				{
					stepOrder: 3,
					instructions: 'Divide dough in half and stretch each into a 12-inch circle.'
				},
				{
					stepOrder: 4,
					instructions: 'Spread tomato sauce over dough, leaving a 1-inch border.'
				},
				{
					stepOrder: 5,
					instructions: 'Distribute mozzarella slices evenly over the sauce.'
				},
				{
					stepOrder: 6,
					instructions: 'Bake for 10-12 minutes until crust is golden and cheese is bubbly.'
				},
				{
					stepOrder: 7,
					instructions: 'Top with fresh basil leaves and drizzle with olive oil before serving.'
				}
			],
			tags: [{ name: 'Italian' }, { name: 'Pizza' }, { name: 'Vegetarian' }, { name: 'Dinner' }]
		});

		// Mexican Recipes
		await createRecipe({
			name: 'Chicken Tacos',
			description:
				'Flavorful Mexican street tacos with seasoned chicken, fresh toppings, and warm tortillas.',
			ingredients: [
				{ name: '500g Chicken breast, diced' },
				{ name: '8-10 small Corn tortillas' },
				{ name: '2 Limes, juiced' },
				{ name: '1 cup Cilantro, chopped' },
				{ name: '1 medium White onion, diced' },
				{ name: '1 tbsp Chili powder' },
				{ name: '1 tsp Cumin' },
				{ name: '1 tsp Garlic powder' },
				{ name: 'Salt to taste' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions: 'Season diced chicken with chili powder, cumin, garlic powder, and salt.'
				},
				{
					stepOrder: 2,
					instructions: 'Heat a large skillet over medium-high heat with a little oil.'
				},
				{
					stepOrder: 3,
					instructions: 'Cook chicken until golden brown and cooked through, about 8-10 minutes.'
				},
				{ stepOrder: 4, instructions: 'Squeeze lime juice over the chicken and toss.' },
				{ stepOrder: 5, instructions: 'Warm tortillas in a dry pan for 30 seconds per side.' },
				{
					stepOrder: 6,
					instructions:
						'Fill tortillas with chicken and top with onion and cilantro. Serve with lime wedges.'
				}
			],
			tags: [{ name: 'Mexican' }, { name: 'Tacos' }, { name: 'Quick' }, { name: 'Dinner' }]
		});

		// Asian Recipes
		await createRecipe({
			name: 'Pad Thai',
			description:
				'Classic Thai stir-fried noodles with shrimp, tofu, peanuts, and a perfect balance of sweet, sour, and savory.',
			ingredients: [
				{ name: '300g Rice noodles, dried' },
				{ name: '300g Shrimp, peeled and deveined' },
				{ name: '200g Firm tofu, cubed' },
				{ name: '2 large Eggs' },
				{ name: '2 cups Bean sprouts' },
				{ name: '1/2 cup Peanuts, crushed' },
				{ name: '3 Green onions, sliced' },
				{ name: '3 tbsp Tamarind paste' },
				{ name: '3 tbsp Fish sauce' },
				{ name: '2 tbsp Brown sugar' },
				{ name: '2 Limes, cut into wedges' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions: 'Soak rice noodles in warm water for 30 minutes, then drain.'
				},
				{
					stepOrder: 2,
					instructions: 'Mix tamarind paste, fish sauce, and brown sugar to make the sauce.'
				},
				{
					stepOrder: 3,
					instructions: 'Heat oil in a wok over high heat. Cook tofu until golden, then set aside.'
				},
				{
					stepOrder: 4,
					instructions: 'Add shrimp to wok and cook until pink, about 2-3 minutes. Set aside.'
				},
				{ stepOrder: 5, instructions: 'Scramble eggs in the wok, then add noodles and sauce.' },
				{
					stepOrder: 6,
					instructions:
						'Stir-fry for 2-3 minutes, then add shrimp, tofu, bean sprouts, and half the peanuts.'
				},
				{
					stepOrder: 7,
					instructions:
						'Toss everything together and serve topped with remaining peanuts, green onions, and lime.'
				}
			],
			tags: [{ name: 'Thai' }, { name: 'Noodles' }, { name: 'Dinner' }, { name: 'Asian' }]
		});

		// American Recipes
		await createRecipe({
			name: 'Classic Cheeseburger',
			description:
				'Juicy homemade burger with melted cheese, crispy lettuce, fresh tomato, and special sauce on a toasted bun.',
			ingredients: [
				{ name: '600g Ground beef, 80/20 lean' },
				{ name: '4 Burger buns, toasted' },
				{ name: '4 slices Cheddar cheese' },
				{ name: '4 Lettuce leaves' },
				{ name: '1 large Tomato, sliced' },
				{ name: '1 small Onion, sliced' },
				{ name: '8 Pickle slices' },
				{ name: '4 tbsp Mayonnaise' },
				{ name: '2 tbsp Ketchup' },
				{ name: 'Salt and pepper to taste' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions: 'Divide ground beef into 4 equal portions and shape into patties.'
				},
				{ stepOrder: 2, instructions: 'Season both sides generously with salt and pepper.' },
				{ stepOrder: 3, instructions: 'Heat a grill or skillet over medium-high heat.' },
				{ stepOrder: 4, instructions: 'Cook burgers for 4 minutes per side for medium doneness.' },
				{
					stepOrder: 5,
					instructions: 'Add cheese slices in the last minute of cooking and cover to melt.'
				},
				{ stepOrder: 6, instructions: 'Mix mayonnaise and ketchup for special sauce.' },
				{
					stepOrder: 7,
					instructions:
						'Assemble burgers with sauce on bottom bun, then lettuce, tomato, burger, onion, pickles, and top bun.'
				}
			],
			tags: [{ name: 'American' }, { name: 'Burger' }, { name: 'Quick' }, { name: 'Dinner' }]
		});

		// Breakfast
		await createRecipe({
			name: 'French Toast',
			description:
				'Crispy on the outside, custardy on the inside French toast with cinnamon and vanilla. Perfect weekend breakfast.',
			ingredients: [
				{ name: '8 slices Bread, thick-cut' },
				{ name: '4 large Eggs' },
				{ name: '1/2 cup Milk' },
				{ name: '1 tsp Vanilla extract' },
				{ name: '1 tsp Cinnamon' },
				{ name: '2 tbsp Butter' },
				{ name: 'Maple syrup for serving' },
				{ name: 'Powdered sugar for dusting' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions: 'Whisk together eggs, milk, vanilla, and cinnamon in a shallow bowl.'
				},
				{ stepOrder: 2, instructions: 'Heat butter in a large skillet over medium heat.' },
				{ stepOrder: 3, instructions: 'Dip bread slices in egg mixture, coating both sides.' },
				{
					stepOrder: 4,
					instructions: 'Cook bread until golden brown, about 3 minutes per side.'
				},
				{
					stepOrder: 5,
					instructions: 'Serve hot with maple syrup and a dusting of powdered sugar.'
				}
			],
			tags: [{ name: 'Breakfast' }, { name: 'French' }, { name: 'Quick' }, { name: 'Vegetarian' }]
		});

		// Dessert
		await createRecipe({
			name: 'Chocolate Chip Cookies',
			description:
				'Classic homemade chocolate chip cookies with crispy edges and chewy centers. The perfect afternoon treat.',
			ingredients: [
				{ name: '2 1/4 cups All-purpose flour' },
				{ name: '1 cup Butter, softened' },
				{ name: '3/4 cup Granulated sugar' },
				{ name: '3/4 cup Brown sugar, packed' },
				{ name: '2 large Eggs' },
				{ name: '1 tsp Vanilla extract' },
				{ name: '1 tsp Baking soda' },
				{ name: '1/2 tsp Salt' },
				{ name: '2 cups Chocolate chips' }
			],
			instructions: [
				{ stepOrder: 1, instructions: 'Preheat oven to 190°C (375°F).' },
				{
					stepOrder: 2,
					instructions: 'Cream together butter, granulated sugar, and brown sugar until fluffy.'
				},
				{ stepOrder: 3, instructions: 'Beat in eggs and vanilla extract.' },
				{
					stepOrder: 4,
					instructions: 'In another bowl, whisk together flour, baking soda, and salt.'
				},
				{ stepOrder: 5, instructions: 'Gradually mix dry ingredients into wet ingredients.' },
				{ stepOrder: 6, instructions: 'Fold in chocolate chips.' },
				{
					stepOrder: 7,
					instructions: 'Drop rounded tablespoons of dough onto baking sheets, 2 inches apart.'
				},
				{ stepOrder: 8, instructions: 'Bake for 10-12 minutes until edges are golden.' },
				{
					stepOrder: 9,
					instructions: 'Cool on baking sheet for 5 minutes before transferring to wire rack.'
				}
			],
			tags: [{ name: 'Dessert' }, { name: 'Baking' }, { name: 'Cookies' }, { name: 'Kid-Friendly' }]
		});

		// Vegetarian
		await createRecipe({
			name: 'Vegetable Stir-Fry',
			description:
				'Colorful mix of fresh vegetables in a savory Asian-inspired sauce. Healthy, quick, and customizable.',
			ingredients: [
				{ name: '2 cups Broccoli florets' },
				{ name: '2 Bell peppers, sliced' },
				{ name: '2 Carrots, julienned' },
				{ name: '1 cup Snap peas' },
				{ name: '3 cloves Garlic, minced' },
				{ name: '1 tbsp Ginger, grated' },
				{ name: '3 tbsp Soy sauce' },
				{ name: '1 tbsp Sesame oil' },
				{ name: '2 tbsp Vegetable oil' },
				{ name: 'Rice for serving' }
			],
			instructions: [
				{
					stepOrder: 1,
					instructions: 'Heat vegetable oil in a wok or large skillet over high heat.'
				},
				{
					stepOrder: 2,
					instructions: 'Add garlic and ginger, stir-fry for 30 seconds until fragrant.'
				},
				{
					stepOrder: 3,
					instructions: 'Add broccoli and carrots, stir-fry for 3-4 minutes until slightly tender.'
				},
				{
					stepOrder: 4,
					instructions: 'Add bell peppers and snap peas, cook for 2 more minutes.'
				},
				{ stepOrder: 5, instructions: 'Pour in soy sauce and sesame oil, toss to coat.' },
				{ stepOrder: 6, instructions: 'Serve immediately over steamed rice.' }
			],
			tags: [
				{ name: 'Vegetarian' },
				{ name: 'Asian' },
				{ name: 'Quick' },
				{ name: 'Healthy' },
				{ name: 'Vegan' }
			]
		});

		console.log('✅ Seed completed successfully!');
		console.log('   Created 8 sample recipes with diverse cuisines and meal types.');
	} catch (error) {
		console.error('❌ Seed failed:', error);
		throw error;
	} finally {
		await client.end();
	}
}

// Allow running directly with: tsx scripts/seed.ts
// Use --force flag to skip confirmation: tsx scripts/seed.ts --force
const hasForceFlag = process.argv.includes('--force');
seed({ force: hasForceFlag })
	.then(() => process.exit(0))
	.catch(() => process.exit(1));
