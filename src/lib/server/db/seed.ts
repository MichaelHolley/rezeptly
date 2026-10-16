import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import postgres from 'postgres';
import slugify from 'slugify';
import type { RecipeCourse, TagCategory } from '../types';
import {
	ingredientSections,
	ingredients,
	instructions,
	recipes,
	recipesToTags,
	tags
} from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL is not set');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, {
	schema: { recipes, ingredientSections, ingredients, instructions, tags, recipesToTags }
});

const sampleData = [
	{
		name: 'Classic Scrambled Eggs',
		course: 'main' as RecipeCourse,
		durationMinutes: 15,
		portions: 2,
		description: 'Fluffy, creamy scrambled eggs perfect for breakfast',
		ingredientGroups: [
			{
				heading: null,
				items: [
					'4 large eggs',
					'2 tablespoons butter',
					'2 tablespoons milk',
					'Salt and pepper to taste'
				]
			}
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
		tags: [
			{ name: 'Breakfast', category: 'type' as TagCategory },
			{ name: 'Vegetarian', category: 'diet' as TagCategory }
		]
	},
	{
		name: 'Homemade Margherita Pizza',
		course: 'main' as RecipeCourse,
		durationMinutes: 45,
		portions: 4,
		description: 'Traditional Italian pizza with fresh mozzarella, basil, and tomato sauce',
		ingredientGroups: [
			{ heading: 'Dough', items: ['1 pound pizza dough', '2 tablespoons olive oil'] },
			{
				heading: 'Toppings',
				items: [
					'1 cup tomato sauce',
					'8 oz fresh mozzarella, sliced',
					'Fresh basil leaves',
					'Salt to taste'
				]
			}
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
		tags: [
			{ name: 'Dinner', category: 'type' as TagCategory },
			{ name: 'Italian', category: 'cuisine' as TagCategory },
			{ name: 'Vegetarian', category: 'diet' as TagCategory }
		]
	},
	{
		name: 'Chicken Stir-Fry',
		course: 'main' as RecipeCourse,
		durationMinutes: 30,
		portions: 4,
		description: 'Quick and healthy Asian-inspired chicken with colorful vegetables',
		ingredientGroups: [
			{
				heading: 'Sauce',
				items: ['3 tablespoons soy sauce', '1 tablespoon sesame oil', '1 teaspoon cornstarch']
			},
			{
				heading: 'Stir-Fry',
				items: [
					'1 lb boneless chicken breast, sliced',
					'2 cups mixed bell peppers, sliced',
					'1 cup broccoli florets',
					'3 cloves garlic, minced',
					'1 tablespoon ginger, grated',
					'2 tablespoons vegetable oil'
				]
			}
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
		tags: [
			{ name: 'Dinner', category: 'type' as TagCategory },
			{ name: 'Asian', category: 'cuisine' as TagCategory },
			{ name: 'High Protein', category: 'nutrition' as TagCategory }
		]
	},
	{
		name: 'Classic Chocolate Chip Cookies',
		course: 'dessert' as RecipeCourse,
		durationMinutes: 30,
		portions: 24,
		description: 'Soft and chewy cookies loaded with chocolate chips',
		ingredientGroups: [
			{
				heading: 'Dry Ingredients',
				items: ['2 1/4 cups all-purpose flour', '1 teaspoon baking soda', '1 teaspoon salt']
			},
			{
				heading: 'Wet Ingredients',
				items: [
					'1 cup butter, softened',
					'3/4 cup granulated sugar',
					'3/4 cup brown sugar',
					'2 large eggs',
					'2 teaspoons vanilla extract'
				]
			},
			{ heading: 'Mix-Ins', items: ['2 cups chocolate chips'] }
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
		tags: [
			{ name: 'Dessert', category: 'type' as TagCategory },
			{ name: 'Vegetarian', category: 'diet' as TagCategory }
		]
	},
	{
		name: 'Greek Salad',
		course: 'appetizer' as RecipeCourse,
		durationMinutes: 15,
		portions: 2,
		description: 'Fresh Mediterranean salad with feta cheese and olives',
		ingredientGroups: [
			{
				heading: 'Salad',
				items: [
					'4 cups romaine lettuce, chopped',
					'2 large tomatoes, diced',
					'1 cucumber, sliced',
					'1 red onion, thinly sliced',
					'1 cup kalamata olives',
					'1 cup feta cheese, crumbled'
				]
			},
			{
				heading: 'Dressing',
				items: [
					'1/4 cup olive oil',
					'2 tablespoons red wine vinegar',
					'1 teaspoon dried oregano',
					'Salt and pepper to taste'
				]
			}
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
		tags: [
			{ name: 'Salad', category: 'type' as TagCategory },
			{ name: 'Greek', category: 'cuisine' as TagCategory },
			{ name: 'Vegetarian', category: 'diet' as TagCategory },
			{ name: 'Low Calorie', category: 'nutrition' as TagCategory }
		]
	},
	{
		name: 'Beef Tacos',
		course: 'main' as RecipeCourse,
		durationMinutes: 30,
		portions: 4,
		description: 'Flavorful Mexican-style tacos with seasoned ground beef',
		ingredientGroups: [
			{
				heading: 'Beef Filling',
				items: [
					'1 lb ground beef',
					'1 onion, diced',
					'2 cloves garlic, minced',
					'2 tablespoons taco seasoning',
					'1/2 cup water'
				]
			},
			{
				heading: 'For Assembly',
				items: [
					'8 taco shells',
					'1 cup shredded lettuce',
					'1 cup shredded cheddar cheese',
					'1 tomato, diced',
					'Sour cream and salsa for serving'
				]
			}
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
		tags: [
			{ name: 'Dinner', category: 'type' as TagCategory },
			{ name: 'Mexican', category: 'cuisine' as TagCategory }
		]
	},
	{
		name: 'Blueberry Pancakes',
		course: 'main' as RecipeCourse,
		durationMinutes: 15,
		portions: 4,
		description: 'Fluffy buttermilk pancakes studded with fresh blueberries',
		ingredientGroups: [
			{
				heading: 'Dry Ingredients',
				items: [
					'2 cups all-purpose flour',
					'2 tablespoons sugar',
					'2 teaspoons baking powder',
					'1 teaspoon baking soda',
					'1/2 teaspoon salt'
				]
			},
			{
				heading: 'Wet Ingredients',
				items: ['2 cups buttermilk', '2 large eggs', '1/4 cup melted butter']
			},
			{
				heading: 'To Finish',
				items: ['1 cup fresh blueberries', 'Maple syrup for serving']
			}
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
		tags: [
			{ name: 'Breakfast', category: 'type' as TagCategory },
			{ name: 'Vegetarian', category: 'diet' as TagCategory }
		]
	},
	{
		name: 'Caprese Salad',
		course: 'appetizer' as RecipeCourse,
		durationMinutes: 15,
		portions: 2,
		description: 'Simple Italian salad with tomatoes, mozzarella, and basil',
		ingredientGroups: [
			{
				heading: null,
				items: [
					'4 large ripe tomatoes, sliced',
					'1 lb fresh mozzarella, sliced',
					'Fresh basil leaves',
					'1/4 cup extra virgin olive oil',
					'2 tablespoons balsamic vinegar',
					'Salt and pepper to taste'
				]
			}
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
		tags: [
			{ name: 'Salad', category: 'type' as TagCategory },
			{ name: 'Italian', category: 'cuisine' as TagCategory },
			{ name: 'Vegetarian', category: 'diet' as TagCategory }
		]
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
			await tx.delete(ingredientSections);
			console.log('   ✓ Cleared ingredient sections');
			await tx.delete(instructions);
			console.log('   ✓ Cleared instructions');
			await tx.delete(recipes);
			console.log('   ✓ Cleared recipes');
			await tx.delete(tags);
			console.log('   ✓ Cleared tags');

			// Reset sequences
			await tx.execute(sql`ALTER SEQUENCE recipes_id_seq RESTART WITH 1`);
			await tx.execute(sql`ALTER SEQUENCE ingredient_sections_id_seq RESTART WITH 1`);
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
			const toSlug = (name: string) =>
				slugify(name, { lower: true, strict: true }) ||
				name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			const tagKey = (name: string, category: TagCategory) => `${toSlug(name)}::${category}`;

			const allTagInputs = [
				...new Map(
					sampleData.flatMap((r) => r.tags).map((t) => [tagKey(t.name, t.category), t])
				).values()
			];

			console.log('🏷️  Creating tags...');
			const createdTags = new Map<string, { id: number }>();

			for (const tagInput of allTagInputs) {
				const slug = toSlug(tagInput.name);
				const key = tagKey(tagInput.name, tagInput.category);
				try {
					const [newTag] = await tx
						.insert(tags)
						.values({ name: tagInput.name, slug, category: tagInput.category })
						.onConflictDoNothing()
						.returning();
					if (newTag) {
						createdTags.set(key, newTag);
						console.log(`   ✓ Created tag: ${tagInput.name} (${tagInput.category})`);
					} else {
						const [existing] = await tx
							.select()
							.from(tags)
							.where(sql`slug = ${slug} AND category = ${tagInput.category}`);
						if (existing) {
							createdTags.set(key, existing);
							console.log(`   ℹ Tag already exists: ${tagInput.name} (${tagInput.category})`);
						}
					}
				} catch {
					console.log(`   ⚠ Skipped tag: ${tagInput.name} (${tagInput.category})`);
				}
			}

			console.log('\n🍳 Creating recipes...');
			for (const [index, recipeData] of sampleData.entries()) {
				// The last sample stays a draft so the drafts view has something to show
				const isDraft = index === sampleData.length - 1;

				// Create recipe
				const [recipe] = await tx
					.insert(recipes)
					.values({
						name: recipeData.name,
						slug: slugify(recipeData.name, { lower: true, strict: true }),
						description: recipeData.description,
						course: recipeData.course,
						durationMinutes: recipeData.durationMinutes,
						portions: recipeData.portions,
						publishedAt: isDraft ? null : new Date()
					})
					.returning();

				console.log(`   ✓ Created recipe: ${recipe.name}${isDraft ? ' (draft)' : ''}`);

				// Create ingredient groups
				let sectionOrder = 0;
				let ingredientCount = 0;
				for (const group of recipeData.ingredientGroups) {
					let sectionId: number | null = null;
					if (group.heading !== null) {
						sectionOrder += 1;
						const [section] = await tx
							.insert(ingredientSections)
							.values({ name: group.heading, sectionOrder, recipeId: recipe.id })
							.returning({ id: ingredientSections.id });
						sectionId = section.id;
					}

					if (group.items.length > 0) {
						await tx.insert(ingredients).values(
							group.items.map((name, index) => ({
								name,
								ingredientOrder: index + 1,
								sectionId,
								recipeId: recipe.id
							}))
						);
						ingredientCount += group.items.length;
					}
				}
				console.log(`     - Added ${ingredientCount} ingredients in ${sectionOrder} sections`);

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
						.map((t) => {
							const tag = createdTags.get(tagKey(t.name, t.category));
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
	console.log('║     rezeptly Database Seed Menu        ║');
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
