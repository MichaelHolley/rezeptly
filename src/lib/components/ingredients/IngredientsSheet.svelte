<script lang="ts">
	import {
		addIngredientSection,
		getRecipeBySlug,
		reorderIngredientHierarchy,
		updateRecipePortions
	} from '#lib/api/recipes.remote.js';
	import FieldIssues from '#lib/components/common/FieldIssues.svelte';
	import NumberStepper from '#lib/components/common/NumberStepper.svelte';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import type { IngredientGroup } from '#lib/shared/ingredients.js';
	import { reportError } from '#lib/shared/toast.js';
	import type { Ingredient } from '#lib/server/types.js';
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
		groups: serverGroups,
		portions
	}: {
		recipeId: number;
		recipeSlug: string;
		groups: IngredientGroup[];
		portions: number | null;
	} = $props();

	let draftPortions = $state(untrack(() => portions));
	let dragGroups = $state.raw<IngredientGroup[] | null>(null);
	let editingId = $state<number | null>(null);
	let announcement = $state('');
	let persistTimer: ReturnType<typeof setTimeout> | undefined;

	const groups = $derived(dragGroups ?? serverGroups);
	const namedGroups = $derived(groups.slice(1));
	const isSaving = $derived(reorderIngredientHierarchy.pending > 0);
	const sectionForm = $derived(addIngredientSection.for(recipeId));

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

	function swap<T>(items: T[], from: number, to: number): T[] {
		const next = [...items];
		[next[from], next[to]] = [next[to], next[from]];
		return next;
	}

	function withItems(groupId: number | null, items: Ingredient[]): IngredientGroup[] {
		return groups.map((group) => (group.id === groupId ? { ...group, items } : group));
	}

	async function persist(next: IngredientGroup[], successMessage: string) {
		const query = getRecipeBySlug(recipeSlug);
		try {
			await reorderIngredientHierarchy({
				recipeId,
				ungroupedIngredientIds: next[0].items.map(({ id }) => id),
				sections: next.slice(1).map((group) => ({
					sectionId: group.id!,
					ingredientIds: group.items.map(({ id }) => id)
				}))
			}).updates(query.withOverride((recipe) => ({ ...recipe, ingredientGroups: next })));
			announcement = successMessage;
		} catch (error) {
			reportError(error);
			query.refresh().catch(reportError);
			announcement = 'The previous ingredient order was restored.';
		} finally {
			dragGroups = null;
		}
	}

	function scheduleDragSave() {
		// A drag across sections finalizes both zones; defer so they persist as one save.
		clearTimeout(persistTimer);
		persistTimer = setTimeout(() => {
			if (dragGroups) void persist(dragGroups, 'Ingredient order saved.');
		}, 0);
	}

	function handleSectionDnd(event: CustomEvent<DndEvent<IngredientGroup>>, finalized: boolean) {
		dragGroups = [groups[0], ...event.detail.items];
		if (finalized) scheduleDragSave();
	}

	function handleIngredientDnd(groupId: number | null, items: Ingredient[], finalized: boolean) {
		dragGroups = withItems(groupId, items);
		if (finalized) scheduleDragSave();
	}

	function moveSection(groupId: number, direction: -1 | 1) {
		const index = groups.findIndex(({ id }) => id === groupId);
		const target = index + direction;
		if (isSaving || index < 1 || target < 1 || target >= groups.length) return;
		void persist(
			swap(groups, index, target),
			`${groups[index].heading} moved ${direction < 0 ? 'up' : 'down'}.`
		);
	}

	function moveIngredientWithin(groupId: number | null, ingredientId: number, direction: -1 | 1) {
		const items = groups.find(({ id }) => id === groupId)?.items ?? [];
		const index = items.findIndex(({ id }) => id === ingredientId);
		const target = index + direction;
		if (isSaving || index < 0 || target < 0 || target >= items.length) return;
		void persist(
			withItems(groupId, swap(items, index, target)),
			`${items[index].name} moved ${direction < 0 ? 'up' : 'down'}.`
		);
	}

	function moveIngredientTo(
		groupId: number | null,
		ingredientId: number,
		targetGroupId: number | null
	) {
		const source = groups.find(({ id }) => id === groupId);
		const target = groups.find(({ id }) => id === targetGroupId);
		const ingredient = source?.items.find(({ id }) => id === ingredientId);
		if (isSaving || !source || !target || !ingredient || source === target) return;
		const next = groups.map((group) => {
			if (group === source)
				return { ...group, items: group.items.filter((item) => item !== ingredient) };
			if (group === target) return { ...group, items: [...group.items, ingredient] };
			return group;
		});
		void persist(next, `${ingredient.name} moved to ${target.heading ?? 'ungrouped ingredients'}.`);
	}
</script>

<Sheet.Root
	onOpenChange={(open) => {
		if (open) {
			draftPortions = portions;
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
						if (await form.submit()) form.element.reset();
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
						{recipeSlug}
						onItemsConsider={(items) => handleIngredientDnd(null, items, false)}
						onItemsFinalize={(items) => handleIngredientDnd(null, items, true)}
						moveTargets={namedGroups.map((group) => ({ id: group.id, name: group.heading! }))}
						onMoveIngredientUp={(id) => moveIngredientWithin(null, id, -1)}
						onMoveIngredientDown={(id) => moveIngredientWithin(null, id, 1)}
						onMoveIngredientTo={(id, sectionId) => moveIngredientTo(null, id, sectionId)}
					/>
				{/if}

				<div
					class="flex flex-col gap-3 rounded-lg"
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
						<div
							class="rounded-lg"
							animate:flip={{ duration: 150 }}
							aria-label={`Section ${group.heading}`}
						>
							<IngredientBlock
								{group}
								{recipeId}
								{isSaving}
								{editingId}
								onEditStart={(id) => (editingId = id)}
								onEditEnd={() => (editingId = null)}
								{recipeSlug}
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
