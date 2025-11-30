import { eq, inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import postgres from 'postgres';
import { ingredients, instructions, recipes, recipesToTags, tags } from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL is not set');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema: { recipes, ingredients, instructions, tags, recipesToTags } });

const sampleData = [
	{
		name: 'Classic Scrambled Eggs',
		description: 'Fluffy, creamy scrambled eggs perfect for breakfast',
		ingredients: [
			{ name: '4 large eggs' },
			{ name: '2 tablespoons butter' },
			{ name: '2 tablespoons milk' },
			{ name: 'Salt and pepper to taste' }
		],
		instructions: [
			{
				heading: 'Prepare the Eggs',
				instructions:
					'Crack eggs into a bowl, add milk, salt, and pepper. Whisk until well combined.',
				stepOrder: 1
			},
			{
				heading: 'Heat the Pan',
				instructions: 'Heat butter in a non-stick pan over medium-low heat until melted.',
				stepOrder: 2
			},
			{
				heading: 'Cook the Eggs',
				instructions:
					'Pour in egg mixture and gently stir with a spatula until eggs are softly set, about 3-4 minutes.',
				stepOrder: 3
			},
			{
				heading: 'Serve',
				instructions: 'Remove from heat while still slightly creamy. Serve immediately.',
				stepOrder: 4
			}
		],
		tags: ['breakfast', 'quick', 'vegetarian']
	},
	{
		name: 'Homemade Margherita Pizza',
		description: 'Traditional Italian pizza with fresh mozzarella, basil, and tomato sauce',
		ingredients: [
			{ name: '1 pound pizza dough' },
			{ name: '1 cup tomato sauce' },
			{ name: '8 oz fresh mozzarella, sliced' },
			{ name: 'Fresh basil leaves' },
			{ name: '2 tablespoons olive oil' },
			{ name: 'Salt to taste' }
		],
		instructions: [
			{
				heading: 'Prepare the Dough',
				instructions:
					'Preheat oven to 475°F (245°C). Roll out pizza dough on a floured surface to 12-inch circle.',
				stepOrder: 1
			},
			{
				heading: 'Prepare the Dough',
				instructions: 'Transfer dough to a pizza pan or baking sheet. Brush edges with olive oil.',
				stepOrder: 2
			},
			{
				heading: 'Add Toppings',
				instructions:
					'Spread tomato sauce evenly over dough, leaving a 1-inch border. Arrange mozzarella slices on top.',
				stepOrder: 3
			},
			{
				heading: 'Bake',
				instructions: 'Bake for 12-15 minutes until crust is golden and cheese is bubbly.',
				stepOrder: 4
			},
			{
				heading: 'Finish',
				instructions:
					'Remove from oven, top with fresh basil leaves, drizzle with olive oil, and serve.',
				stepOrder: 5
			}
		],
		tags: ['dinner', 'italian', 'vegetarian']
	},
	{
		name: 'Chicken Stir-Fry',
		description: 'Quick and healthy Asian-inspired chicken with colorful vegetables',
		ingredients: [
			{ name: '1 lb boneless chicken breast, sliced' },
			{ name: '2 cups mixed bell peppers, sliced' },
			{ name: '1 cup broccoli florets' },
			{ name: '3 cloves garlic, minced' },
			{ name: '1 tablespoon ginger, grated' },
			{ name: '3 tablespoons soy sauce' },
			{ name: '1 tablespoon sesame oil' },
			{ name: '2 tablespoons vegetable oil' },
			{ name: '1 teaspoon cornstarch' }
		],
		instructions: [
			{
				heading: 'Prepare the Sauce',
				instructions: 'Mix soy sauce, sesame oil, and cornstarch in a small bowl. Set aside.',
				stepOrder: 1
			},
			{
				heading: 'Heat the Wok',
				instructions: 'Heat vegetable oil in a wok or large pan over high heat.',
				stepOrder: 2
			},
			{
				heading: 'Cook the Chicken',
				instructions:
					'Add chicken and stir-fry for 4-5 minutes until cooked through. Remove and set aside.',
				stepOrder: 3
			},
			{
				heading: 'Cook Aromatics',
				instructions: 'Add garlic and ginger to the pan, stir-fry for 30 seconds until fragrant.',
				stepOrder: 4
			},
			{
				heading: 'Cook Vegetables',
				instructions: 'Add vegetables and stir-fry for 3-4 minutes until crisp-tender.',
				stepOrder: 5
			},
			{
				heading: 'Combine and Finish',
				instructions:
					'Return chicken to pan, add sauce mixture, and toss everything together for 1-2 minutes.',
				stepOrder: 6
			}
		],
		tags: ['dinner', 'asian', 'quick', 'healthy']
	},
	{
		name: 'Classic Chocolate Chip Cookies',
		description: 'Soft and chewy cookies loaded with chocolate chips',
		ingredients: [
			{ name: '2 1/4 cups all-purpose flour' },
			{ name: '1 teaspoon baking soda' },
			{ name: '1 teaspoon salt' },
			{ name: '1 cup butter, softened' },
			{ name: '3/4 cup granulated sugar' },
			{ name: '3/4 cup brown sugar' },
			{ name: '2 large eggs' },
			{ name: '2 teaspoons vanilla extract' },
			{ name: '2 cups chocolate chips' }
		],
		instructions: [
			{
				heading: 'Prepare Dry Ingredients',
				instructions: 'Preheat oven to 375°F (190°C). Mix flour, baking soda, and salt in a bowl.',
				stepOrder: 1
			},
			{
				heading: 'Cream Butter and Sugar',
				instructions: 'In another bowl, cream together butter and both sugars until fluffy.',
				stepOrder: 2
			},
			{
				heading: 'Add Wet Ingredients',
				instructions: 'Beat in eggs and vanilla extract.',
				stepOrder: 3
			},
			{
				heading: 'Combine and Add Chips',
				instructions: 'Gradually stir in flour mixture, then fold in chocolate chips.',
				stepOrder: 4
			},
			{
				heading: 'Shape the Cookies',
				instructions: 'Drop rounded tablespoons of dough onto ungreased baking sheets.',
				stepOrder: 5
			},
			{
				heading: 'Bake',
				instructions:
					'Bake for 9-11 minutes until golden brown. Cool on baking sheet for 2 minutes.',
				stepOrder: 6
			}
		],
		tags: ['dessert', 'baking', 'comfort-food']
	},
	{
		name: 'Greek Salad',
		description: 'Fresh Mediterranean salad with feta cheese and olives',
		ingredients: [
			{ name: '4 cups romaine lettuce, chopped' },
			{ name: '2 large tomatoes, diced' },
			{ name: '1 cucumber, sliced' },
			{ name: '1 red onion, thinly sliced' },
			{ name: '1 cup kalamata olives' },
			{ name: '1 cup feta cheese, crumbled' },
			{ name: '1/4 cup olive oil' },
			{ name: '2 tablespoons red wine vinegar' },
			{ name: '1 teaspoon dried oregano' },
			{ name: 'Salt and pepper to taste' }
		],
		instructions: [
			{
				heading: 'Prepare Vegetables',
				instructions: 'In a large bowl, combine lettuce, tomatoes, cucumber, onion, and olives.',
				stepOrder: 1
			},
			{
				heading: 'Make Dressing',
				instructions:
					'In a small bowl, whisk together olive oil, vinegar, oregano, salt, and pepper.',
				stepOrder: 2
			},
			{
				heading: 'Dress the Salad',
				instructions: 'Pour dressing over salad and toss to combine.',
				stepOrder: 3
			},
			{
				heading: 'Add Feta and Serve',
				instructions: 'Top with crumbled feta cheese and serve immediately.',
				stepOrder: 4
			}
		],
		tags: ['lunch', 'dinner', 'healthy', 'vegetarian', 'greek']
	},
	{
		name: 'Beef Tacos',
		description: 'Flavorful Mexican-style tacos with seasoned ground beef',
		ingredients: [
			{ name: '1 lb ground beef' },
			{ name: '1 onion, diced' },
			{ name: '2 cloves garlic, minced' },
			{ name: '2 tablespoons taco seasoning' },
			{ name: '1/2 cup water' },
			{ name: '8 taco shells' },
			{ name: '1 cup shredded lettuce' },
			{ name: '1 cup shredded cheddar cheese' },
			{ name: '1 tomato, diced' },
			{ name: 'Sour cream and salsa for serving' }
		],
		instructions: [
			{
				heading: 'Brown the Beef',
				instructions:
					'Brown ground beef in a large skillet over medium-high heat. Drain excess fat.',
				stepOrder: 1
			},
			{
				heading: 'Cook Aromatics',
				instructions: 'Add onion and garlic, cook for 3-4 minutes until softened.',
				stepOrder: 2
			},
			{
				heading: 'Season and Simmer',
				instructions: 'Stir in taco seasoning and water. Simmer for 5 minutes until thickened.',
				stepOrder: 3
			},
			{
				heading: 'Prepare Shells',
				instructions: 'Warm taco shells according to package directions.',
				stepOrder: 4
			},
			{
				heading: 'Assemble Tacos',
				instructions:
					'Fill shells with beef mixture and top with lettuce, cheese, tomato, sour cream, and salsa.',
				stepOrder: 5
			}
		],
		tags: ['dinner', 'mexican', 'quick', 'comfort-food']
	},
	{
		name: 'Blueberry Pancakes',
		description: 'Fluffy buttermilk pancakes studded with fresh blueberries',
		ingredients: [
			{ name: '2 cups all-purpose flour' },
			{ name: '2 tablespoons sugar' },
			{ name: '2 teaspoons baking powder' },
			{ name: '1 teaspoon baking soda' },
			{ name: '1/2 teaspoon salt' },
			{ name: '2 cups buttermilk' },
			{ name: '2 large eggs' },
			{ name: '1/4 cup melted butter' },
			{ name: '1 cup fresh blueberries' },
			{ name: 'Maple syrup for serving' }
		],
		instructions: [
			{
				heading: 'Mix Dry Ingredients',
				instructions:
					'Whisk together flour, sugar, baking powder, baking soda, and salt in a large bowl.',
				stepOrder: 1
			},
			{
				heading: 'Mix Wet Ingredients',
				instructions: 'In another bowl, whisk together buttermilk, eggs, and melted butter.',
				stepOrder: 2
			},
			{
				heading: 'Combine',
				instructions:
					'Pour wet ingredients into dry ingredients and stir until just combined (batter will be lumpy).',
				stepOrder: 3
			},
			{
				heading: 'Add Blueberries',
				instructions: 'Gently fold in blueberries.',
				stepOrder: 4
			},
			{
				heading: 'Cook Pancakes',
				instructions: 'Heat griddle over medium heat. Pour 1/4 cup batter for each pancake.',
				stepOrder: 5
			},
			{
				heading: 'Flip and Finish',
				instructions:
					'Cook until bubbles form on surface and edges look dry, then flip and cook until golden.',
				stepOrder: 6
			}
		],
		tags: ['breakfast', 'vegetarian', 'comfort-food']
	},
	{
		name: 'Caprese Salad',
		description: 'Simple Italian salad with tomatoes, mozzarella, and basil',
		ingredients: [
			{ name: '4 large ripe tomatoes, sliced' },
			{ name: '1 lb fresh mozzarella, sliced' },
			{ name: 'Fresh basil leaves' },
			{ name: '1/4 cup extra virgin olive oil' },
			{ name: '2 tablespoons balsamic vinegar' },
			{ name: 'Salt and pepper to taste' }
		],
		instructions: [
			{
				heading: 'Arrange Tomatoes and Mozzarella',
				instructions: 'Arrange alternating slices of tomato and mozzarella on a serving platter.',
				stepOrder: 1
			},
			{
				heading: 'Add Basil',
				instructions: 'Tuck basil leaves between the slices.',
				stepOrder: 2
			},
			{
				heading: 'Drizzle Dressing',
				instructions: 'Drizzle with olive oil and balsamic vinegar.',
				stepOrder: 3
			},
			{
				heading: 'Season and Serve',
				instructions: 'Season with salt and pepper. Serve at room temperature.',
				stepOrder: 4
			}
		],
		tags: ['lunch', 'italian', 'vegetarian', 'quick', 'healthy']
	}
];

async function clearDatabase() {
	console.log('🗑️  Clearing database...');
	try {
		await db.transaction(async (tx) => {
			await tx.delete(recipesToTags);
			console.log('   ✓ Cleared recipe-tag associations');
			await tx.delete(ingredients);
			console.log('   ✓ Cleared ingredients');
			await tx.delete(instructions);
			console.log('   ✓ Cleared instructions');
			await tx.delete(recipes);
			console.log('   ✓ Cleared recipes');
			await tx.delete(tags);
			console.log('   ✓ Cleared tags');

			// Reset sequences
			await tx.execute(sql`ALTER SEQUENCE recipes_id_seq RESTART WITH 1`);
			await tx.execute(sql`ALTER SEQUENCE ingredients_id_seq RESTART WITH 1`);
			await tx.execute(sql`ALTER SEQUENCE instructions_id_seq RESTART WITH 1`);
			await tx.execute(sql`ALTER SEQUENCE tags_id_seq RESTART WITH 1`);
			console.log('   ✓ Reset ID sequences');
		});
		console.log('✅ Database cleared successfully!\n');
	} catch (error) {
		console.error('❌ Error clearing database:', error);
		throw error;
	}
}

async function seed() {
	console.log('🌱 Starting database seed...');

	try {
		await db.transaction(async (tx) => {
			console.log('📝 Collecting all unique tags...');
			const allTagNames = [...new Set(sampleData.flatMap((recipe) => recipe.tags))];

			console.log('🏷️  Creating tags...');
			const createdTags = new Map();

			// Batch fetch existing tags
			const existingTags = await tx.select().from(tags).where(inArray(tags.name, allTagNames));
			const existingTagMap = new Map(existingTags.map((t) => [t.name, t]));

			// Insert only missing tags
			for (const tagName of allTagNames) {
				if (existingTagMap.has(tagName)) {
					createdTags.set(tagName, existingTagMap.get(tagName)!);
					console.log(`   ℹ Tag already exists: ${tagName}`);
				} else {
					try {
						const [newTag] = await tx.insert(tags).values({ name: tagName }).returning();
						createdTags.set(tagName, newTag);
						existingTagMap.set(tagName, newTag);
						console.log(`   ✓ Created tag: ${tagName}`);
					} catch {
						// Handle race condition where tag was just created
						const [existingTag] = await tx.select().from(tags).where(eq(tags.name, tagName));
						if (existingTag) {
							createdTags.set(tagName, existingTag);
							existingTagMap.set(tagName, existingTag);
							console.log(`   ℹ Tag already exists: ${tagName}`);
						}
					}
				}
			}

			console.log('\n🍳 Creating recipes...');
			for (const recipeData of sampleData) {
				// Create recipe
				const [recipe] = await tx
					.insert(recipes)
					.values({
						name: recipeData.name,
						description: recipeData.description
					})
					.returning();

				console.log(`   ✓ Created recipe: ${recipe.name}`);

				// Create ingredients
				if (recipeData.ingredients.length > 0) {
					await tx.insert(ingredients).values(
						recipeData.ingredients.map((ing) => ({
							name: ing.name,
							recipeId: recipe.id
						}))
					);
					console.log(`     - Added ${recipeData.ingredients.length} ingredients`);
				}

				// Create instructions
				if (recipeData.instructions.length > 0) {
					await tx.insert(instructions).values(
						recipeData.instructions.map((inst) => ({
							heading: inst.heading,
							instructions: inst.instructions,
							stepOrder: inst.stepOrder,
							recipeId: recipe.id
						}))
					);
					console.log(`     - Added ${recipeData.instructions.length} instructions`);
				}

				// Link tags
				if (recipeData.tags.length > 0) {
					const recipeTags = recipeData.tags
						.map((tagName) => {
							const tag = createdTags.get(tagName);
							return tag ? { recipeId: recipe.id, tagId: tag.id } : null;
						})
						.filter((t) => t !== null);

					if (recipeTags.length > 0) {
						await tx.insert(recipesToTags).values(recipeTags);
						console.log(`     - Linked ${recipeTags.length} tags`);
					}
				}
			}
		});

		console.log('\n✅ Database seeded successfully!');
		console.log(`📊 Created ${sampleData.length} recipes with ingredients, instructions, and tags`);
	} catch (error) {
		console.error('\n❌ Error seeding database:', error);
		throw error;
	}
}

async function showMenu(): Promise<string> {
	const rl = readline.createInterface({ input, output });

	console.log('\n╔════════════════════════════════════════╗');
	console.log('║     Rezeptly Database Seed Menu        ║');
	console.log('╚════════════════════════════════════════╝\n');
	console.log('Please select an option:\n');
	console.log('  1. Seed database (keep existing data)');
	console.log('  2. Clear database and seed with fresh data');
	console.log('  3. Clear database only (no seeding)');
	console.log('  4. Exit\n');

	const answer = await rl.question('Enter your choice (1-4): ');
	rl.close();

	return answer.trim();
}

async function main() {
	// Parse CLI arguments for non-interactive mode
	const args = process.argv.slice(2);
	const hasFlags =
		args.includes('--clear') ||
		args.includes('-c') ||
		args.includes('--seed') ||
		args.includes('-s');

	try {
		if (hasFlags) {
			// Non-interactive mode
			const shouldClear = args.includes('--clear') || args.includes('-c');
			const shouldSeed = args.includes('--seed') || args.includes('-s') || !shouldClear;

			if (shouldClear) {
				await clearDatabase();
			}
			if (shouldSeed) {
				await seed();
			}
		} else {
			// Interactive mode
			const choice = await showMenu();

			switch (choice) {
				case '1':
					await seed();
					break;
				case '2':
					await clearDatabase();
					await seed();
					break;
				case '3':
					await clearDatabase();
					console.log('✅ Database cleared. Exiting without seeding.');
					break;
				case '4':
					console.log('👋 Exiting without changes.');
					break;
				default:
					console.log('❌ Invalid choice. Exiting.');
					process.exit(1);
			}
		}
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	} finally {
		await client.end();
		process.exit(0);
	}
}

main();
