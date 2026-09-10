<script lang="ts">
	import {
		addIngredientSection,
		getRecipeBySlug,
		reorderIngredientHierarchy,
		updateRecipePortions
	} from '$lib/api/recipes.remote';
	import FieldIssues from '$lib/components/common/FieldIssues.svelte';
	import NumberStepper from '$lib/components/common/NumberStepper.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet/';
	import { ingredientEditorGroups, type IngredientEditorGroup } from '$lib/shared/ingredients';
	import { reportError } from '$lib/shared/toast';
	import type { Ingredient, IngredientSectionWithIngredients } from '$lib/server/types';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { useDebounce } from 'runed';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import IngredientBlock from './IngredientBlock.svelte';

	const {
		recipeId,
		recipeSlug,
		ingredients,
		ingredientSections,
		portions
	}: {
		recipeId: number;
		recipeSlug: string;
		ingredients: Ingredient[];
		ingredientSections: IngredientSectionWithIngredients[];
		portions: number | null;
	} = $props();

	let draftPortions = $state(untrack(() => portions));
	let groups = $state<IngredientEditorGroup[]>(
		untrack(() => ingredientEditorGroups({ ingredients, ingredientSections }))
	);
	let editingId = $state<number | null>(null);
	let isSaving = $state(false);
	let announcement = $state('');
	let dragSnapshot: IngredientEditorGroup[] | null = null;
	let persistTimer: ReturnType<typeof setTimeout> | undefined;

	const namedGroups = $derived(groups.slice(1));
	const sectionForm = $derived(addIngredientSection.for(recipeId));

	const savePortions = useDebounce(
		(value: number | null) => updateRecipePortions({ recipeId, portions: value }),
		400
	);

	function cloneGroups(source: IngredientEditorGroup[]): IngredientEditorGroup[] {
		return source.map((group) => ({ ...group, items: [...group.items] }));
	}

	function syncFromProps() {
		groups = ingredientEditorGroups({ ingredients, ingredientSections });
	}

	async function refreshGroups() {
		await getRecipeBySlug(recipeSlug).refresh();
		syncFromProps();
	}

	function handlePortionsChange(value: number | null) {
		draftPortions = value;
		savePortions(value).catch((error) => {
			draftPortions = portions;
			reportError(error);
		});
	}

	function beginDrag() {
		dragSnapshot ??= cloneGroups(groups);
	}

	function replaceGroupItems(groupId: number | null, items: Ingredient[]) {
		groups = groups.map((group) => (group.id === groupId ? { ...group, items } : group));
	}

	function hierarchyInput() {
		return {
			recipeId,
			ungroupedIngredientIds: groups[0]?.items.map(({ id }) => id) ?? [],
			sections: groups.slice(1).map((group) => ({
				sectionId: group.id!,
				ingredientIds: group.items.map(({ id }) => id)
			}))
		};
	}

	async function persist(previous: IngredientEditorGroup[], successMessage: string) {
		if (isSaving) return;
		isSaving = true;
		try {
			await reorderIngredientHierarchy(hierarchyInput());
			announcement = successMessage;
		} catch (error) {
			groups = cloneGroups(previous);
			reportError(error);
			await getRecipeBySlug(recipeSlug).refresh();
			syncFromProps();
			announcement = 'The previous ingredient order was restored.';
		} finally {
			isSaving = false;
			dragSnapshot = null;
		}
	}

	function scheduleDragSave() {
		if (persistTimer) clearTimeout(persistTimer);
		persistTimer = setTimeout(() => {
			const previous = dragSnapshot;
			if (previous) void persist(previous, 'Ingredient order saved.');
		}, 0);
	}

	function handleSectionDnd(
		event: CustomEvent<DndEvent<IngredientEditorGroup>>,
		finalized: boolean
	) {
		beginDrag();
		groups = [groups[0], ...event.detail.items];
		if (finalized) scheduleDragSave();
	}

	function handleIngredientDnd(groupId: number | null, items: Ingredient[], finalized: boolean) {
		beginDrag();
		replaceGroupItems(groupId, items);
		if (finalized) scheduleDragSave();
	}

	function moveSection(groupId: number, direction: -1 | 1) {
		if (isSaving) return;
		const previous = cloneGroups(groups);
		const index = groups.findIndex(({ id }) => id === groupId);
		const target = index + direction;
		if (index < 1 || target < 1 || target >= groups.length) return;
		const next = cloneGroups(groups);
		[next[index], next[target]] = [next[target], next[index]];
		groups = next;
		void persist(previous, `${groups[target].heading} moved ${direction < 0 ? 'up' : 'down'}.`);
	}

	function moveIngredientWithin(groupId: number | null, ingredientId: number, direction: -1 | 1) {
		if (isSaving) return;
		const previous = cloneGroups(groups);
		const groupIndex = groups.findIndex(({ id }) => id === groupId);
		const itemIndex = groups[groupIndex]?.items.findIndex(({ id }) => id === ingredientId) ?? -1;
		const target = itemIndex + direction;
		if (groupIndex < 0 || itemIndex < 0 || target < 0 || target >= groups[groupIndex].items.length)
			return;
		const next = cloneGroups(groups);
		[next[groupIndex].items[itemIndex], next[groupIndex].items[target]] = [
			next[groupIndex].items[target],
			next[groupIndex].items[itemIndex]
		];
		groups = next;
		void persist(
			previous,
			`${groups[groupIndex].items[target].name} moved ${direction < 0 ? 'up' : 'down'}.`
		);
	}

	function moveIngredientTo(
		groupId: number | null,
		ingredientId: number,
		targetGroupId: number | null
	) {
		if (isSaving || groupId === targetGroupId) return;
		const previous = cloneGroups(groups);
		const next = cloneGroups(groups);
		const source = next.find(({ id }) => id === groupId);
		const target = next.find(({ id }) => id === targetGroupId);
		const itemIndex = source?.items.findIndex(({ id }) => id === ingredientId) ?? -1;
		if (!source || !target || itemIndex < 0) return;
		const [ingredient] = source.items.splice(itemIndex, 1);
		target.items.push(ingredient);
		groups = next;
		void persist(
			previous,
			`${ingredient.name} moved to ${target.heading ?? 'ungrouped ingredients'}.`
		);
	}
</script>

<Sheet.Root
	onOpenChange={(open) => {
		if (open) {
			draftPortions = portions;
			syncFromProps();
		} else {
			editingId = null;
			sectionForm.element?.reset();
		}
	}}
>
	<Sheet.Trigger class={buttonVariants({ variant: 'ghost' })} title="Edit Ingredients">
		<PenIcon />
	</Sheet.Trigger>
	<Sheet.Content class="max-h-svh">
		<Sheet.Header>
			<Sheet.Title>Edit Ingredients</Sheet.Title>
			<Sheet.Description>Group ingredients and arrange their reading order.</Sheet.Description>
			<div class="mt-4 inline-flex items-center gap-2">
				<UsersIcon />
				<NumberStepper
					label="Portions"
					value={draftPortions}
					onchange={handlePortionsChange}
					placeholder="—"
				/>
			</div>
			<form
				{...sectionForm.enhance(async (form) => {
					try {
						if (await form.submit()) {
							form.element.reset();
							await refreshGroups();
						}
					} catch (error) {
						reportError(error);
					}
				})}
				class="mt-4 flex items-start gap-2"
			>
				<input {...sectionForm.fields.recipeId.as('hidden', recipeId)} />
				<div class="form-group flex-1">
					<label class="sr-only" for="new-ingredient-section">New section name</label>
					<Input
						id="new-ingredient-section"
						required
						{...sectionForm.fields.name.as('text')}
						placeholder="New section"
						disabled={!!sectionForm.pending || isSaving}
					/>
					<FieldIssues issues={sectionForm.fields.name.issues()} />
				</div>
				<Button
					type="submit"
					size="icon"
					title="Add ingredient section"
					disabled={!!sectionForm.pending || isSaving}
				>
					<PlusIcon />
				</Button>
			</form>
		</Sheet.Header>

		<div class="h-full overflow-y-auto px-4 py-2">
			<div class="flex flex-col gap-3">
				{#if groups[0]}
					<IngredientBlock
						group={groups[0]}
						{recipeId}
						{isSaving}
						{editingId}
						onEditStart={(id) => (editingId = id)}
						onEditEnd={() => (editingId = null)}
						onChanged={refreshGroups}
						onItemsConsider={(items) => handleIngredientDnd(null, items, false)}
						onItemsFinalize={(items) => handleIngredientDnd(null, items, true)}
						canMoveSectionUp={false}
						canMoveSectionDown={false}
						onMoveSectionUp={() => {}}
						onMoveSectionDown={() => {}}
						moveTargets={namedGroups.map((group) => ({ id: group.id, name: group.heading! }))}
						onMoveIngredientUp={(id) => moveIngredientWithin(null, id, -1)}
						onMoveIngredientDown={(id) => moveIngredientWithin(null, id, 1)}
						onMoveIngredientTo={(id, sectionId) => moveIngredientTo(null, id, sectionId)}
					/>
				{/if}

				<div
					class="flex flex-col gap-3"
					use:dragHandleZone={{
						items: namedGroups,
						type: 'ingredient-sections',
						flipDurationMs: 150,
						delayTouchStart: true,
						dropTargetStyle: { outline: '2px solid oklch(70.5% 0.213 47.604 / 0.5)' },
						dragDisabled: isSaving
					}}
					onconsider={(event) => handleSectionDnd(event, false)}
					onfinalize={(event) => handleSectionDnd(event, true)}
					aria-label="Ingredient section order"
				>
					{#each namedGroups as group, index (group.id)}
						<div animate:flip={{ duration: 150 }} aria-label={`Section ${group.heading}`}>
							<IngredientBlock
								{group}
								{recipeId}
								{isSaving}
								{editingId}
								onEditStart={(id) => (editingId = id)}
								onEditEnd={() => (editingId = null)}
								onChanged={refreshGroups}
								onItemsConsider={(items) => handleIngredientDnd(group.id, items, false)}
								onItemsFinalize={(items) => handleIngredientDnd(group.id, items, true)}
								canMoveSectionUp={index > 0}
								canMoveSectionDown={index < namedGroups.length - 1}
								onMoveSectionUp={() => moveSection(group.id!, -1)}
								onMoveSectionDown={() => moveSection(group.id!, 1)}
								moveTargets={groups
									.filter(({ id }) => id !== group.id)
									.map((target) => ({
										id: target.id,
										name: target.heading ?? 'Ungrouped'
									}))}
								onMoveIngredientUp={(id) => moveIngredientWithin(group.id, id, -1)}
								onMoveIngredientDown={(id) => moveIngredientWithin(group.id, id, 1)}
								onMoveIngredientTo={(id, sectionId) => moveIngredientTo(group.id, id, sectionId)}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<p class="sr-only" aria-live="polite">{announcement}</p>
		<Sheet.Footer>
			<Sheet.Close><Button type="button">Close</Button></Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
