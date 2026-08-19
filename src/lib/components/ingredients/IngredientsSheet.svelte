<script lang="ts">
	import { addIngredient, getRecipeBySlug, updateRecipePortions } from '$lib/api/recipes.remote';
	import FieldIssues from '$lib/components/common/FieldIssues.svelte';
	import NumberStepper from '$lib/components/common/NumberStepper.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet/';
	import { reportError } from '$lib/shared/toast';
	import type { Ingredient } from '$lib/server/types';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { useDebounce } from 'runed';
	import { untrack } from 'svelte';
	import IngredientItem from './IngredientItem.svelte';

	const {
		recipeId,
		recipeSlug,
		ingredients,
		portions
	}: {
		recipeId: number;
		recipeSlug: string;
		ingredients: Ingredient[];
		portions: number | null;
	} = $props();

	let draftPortions = $state(untrack(() => portions));

	const savePortions = useDebounce(
		(value: number | null) => updateRecipePortions({ recipeId, portions: value }),
		400
	);

	function handlePortionsChange(value: number | null) {
		draftPortions = value;
		savePortions(value).catch((error) => {
			draftPortions = portions;
			reportError(error);
		});
	}

	let inputRef = $state<HTMLInputElement | null>(null);
	let editingId = $state<number | null>(null);
</script>

<Sheet.Root
	onOpenChange={(open) => {
		if (!open) {
			editingId = null;
			addIngredient.element?.reset();
		}
	}}
>
	<Sheet.Trigger class={buttonVariants({ variant: 'ghost' })} title="Edit Ingredients">
		<PenIcon />
	</Sheet.Trigger>
	<Sheet.Content class="max-h-svh">
		<Sheet.Header>
			<Sheet.Title>Edit Ingredients</Sheet.Title>
			<Sheet.Description>Make changes to the ingredients for this recipe.</Sheet.Description>
			<div class="mt-4">
				<div class="inline-flex items-center gap-2">
					<UsersIcon class="h-5 w-5" />
					<NumberStepper
						label="Portions"
						value={draftPortions}
						onchange={handlePortionsChange}
						placeholder="—"
					/>
				</div>
			</div>
			<form
				{...addIngredient.enhance(async (form) => {
					try {
						const name = form.fields.name.value() ?? '';
						await form
							.submit()
							.updates(
								getRecipeBySlug(recipeSlug).withOverride((recipe) => ({
									...recipe,
									ingredients: [...recipe.ingredients, { name, id: 0, recipeId }]
								}))
							)
							.then((success) => {
								if (success) {
									form.element.reset();
									setTimeout(() => inputRef?.focus(), 50);
								}
							});
					} catch (error) {
						reportError(error);
					}
				})}
				class="mt-6 flex flex-row gap-2"
			>
				<input {...addIngredient.fields.recipeId.as('hidden', recipeId)} />
				<div class="form-group flex-1">
					<Input
						required
						{...addIngredient.fields.name.as('text')}
						placeholder="Ingredient & Quantity"
						disabled={!!addIngredient.pending}
						bind:ref={inputRef}
					/>
					<FieldIssues issues={addIngredient.fields.name.issues()} />
				</div>
				<Button type="submit" disabled={!!addIngredient.pending}><PlusIcon /></Button>
			</form>
		</Sheet.Header>

		<div class="h-full overflow-y-auto px-4">
			<div class="flex flex-col gap-2 py-1">
				{#each ingredients as ingr, i (ingr.id)}
					<IngredientItem
						ingredient={ingr}
						{recipeId}
						{recipeSlug}
						isEditing={editingId === ingr.id}
						onEditStart={() => (editingId = ingr.id)}
						onEditEnd={() => (editingId = null)}
					/>
					{#if i !== ingredients.length - 1}
						<Separator />
					{/if}
				{/each}
			</div>
		</div>
		<Sheet.Footer>
			<Sheet.Close>
				<Button type="button">Close</Button>
			</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
