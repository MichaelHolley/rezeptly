<script lang="ts">
	import {
		addIngredient,
		removeIngredientSection,
		renameIngredientSection
	} from '$lib/api/recipes.remote';
	import FieldIssues from '$lib/components/common/FieldIssues.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import type { IngredientEditorGroup } from '$lib/shared/ingredients';
	import { reportError } from '$lib/shared/toast';
	import type { Ingredient } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import IngredientItem from './IngredientItem.svelte';

	const {
		group,
		recipeId,
		isSaving,
		editingId,
		onEditStart,
		onEditEnd,
		onChanged,
		onItemsConsider,
		onItemsFinalize,
		canMoveSectionUp,
		canMoveSectionDown,
		onMoveSectionUp,
		onMoveSectionDown,
		moveTargets,
		onMoveIngredientUp,
		onMoveIngredientDown,
		onMoveIngredientTo
	}: {
		group: IngredientEditorGroup;
		recipeId: number;
		isSaving: boolean;
		editingId: number | null;
		onEditStart: (id: number) => void;
		onEditEnd: () => void;
		onChanged: () => Promise<void>;
		onItemsConsider: (items: Ingredient[]) => void;
		onItemsFinalize: (items: Ingredient[]) => void;
		canMoveSectionUp: boolean;
		canMoveSectionDown: boolean;
		onMoveSectionUp: () => void;
		onMoveSectionDown: () => void;
		moveTargets: { id: number | null; name: string }[];
		onMoveIngredientUp: (ingredientId: number) => void;
		onMoveIngredientDown: (ingredientId: number) => void;
		onMoveIngredientTo: (ingredientId: number, sectionId: number | null) => void;
	} = $props();

	const addForm = $derived(addIngredient.for(group.id ?? 'ungrouped'));
	const renameForm = $derived(renameIngredientSection.for(group.id ?? 'ungrouped'));
	let inputRef = $state<HTMLInputElement | null>(null);
	let sectionInputRef = $state<HTMLInputElement | null>(null);
	let sectionEditValue = $state(untrack(() => group.heading ?? ''));
	let isEditingSection = $state(false);

	function editSection() {
		sectionEditValue = group.heading ?? '';
		isEditingSection = true;
		setTimeout(() => sectionInputRef?.focus(), 50);
	}

	function cancelSectionEdit() {
		renameForm.element?.reset();
		isEditingSection = false;
	}

	function handleDnd(event: CustomEvent<DndEvent<Ingredient>>, finalized: boolean) {
		if (finalized) onItemsFinalize(event.detail.items);
		else onItemsConsider(event.detail.items);
	}
</script>

<section
	class="bg-background flex flex-col gap-3 rounded-lg border p-3"
	aria-label={group.heading ? `${group.heading} ingredients` : 'Ungrouped ingredients'}
>
	{#if group.id !== null}
		<div class="flex items-start gap-1">
			<button
				type="button"
				use:dragHandle
				class="text-muted-foreground hover:text-foreground cursor-grab rounded p-2 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
				aria-label={`Drag section ${group.heading}`}
				disabled={isSaving}
			>
				<GripVerticalIcon />
			</button>
			{#if isEditingSection}
				<form
					{...renameForm.enhance(async ({ submit }) => {
						try {
							if (await submit()) {
								isEditingSection = false;
								await onChanged();
							}
						} catch (error) {
							reportError(error);
						}
					})}
					class="flex flex-1 items-start gap-1"
				>
					<input {...renameForm.fields.recipeId.as('hidden', recipeId)} />
					<input {...renameForm.fields.sectionId.as('hidden', group.id)} />
					<div class="form-group flex-1">
						<label class="sr-only" for={`section-${group.id}`}>Section name</label>
						<Input
							id={`section-${group.id}`}
							required
							{...renameForm.fields.name.as('text')}
							bind:value={sectionEditValue}
							bind:ref={sectionInputRef}
							disabled={!!renameForm.pending || isSaving}
							onkeydown={(event) => {
								event.stopPropagation();
								if (event.key === 'Escape') cancelSectionEdit();
							}}
						/>
						<FieldIssues issues={renameForm.fields.name.issues()} />
					</div>
					<Button
						type="submit"
						variant="ghost"
						size="icon"
						title="Save section name"
						disabled={!!renameForm.pending || isSaving}
					>
						<CheckIcon />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						title="Cancel section edit"
						onclick={cancelSectionEdit}
					>
						<XIcon />
					</Button>
				</form>
			{:else}
				<button
					type="button"
					class="flex-1 px-1 py-2 text-left font-semibold"
					title="Edit section"
					onclick={editSection}
				>
					{group.heading}
				</button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' })}
						aria-label={`Move section ${group.heading}`}
						disabled={isSaving}
					>
						<MoreHorizontalIcon />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Group>
							<DropdownMenu.Item disabled={!canMoveSectionUp} onSelect={onMoveSectionUp}
								>Move section up</DropdownMenu.Item
							>
							<DropdownMenu.Item disabled={!canMoveSectionDown} onSelect={onMoveSectionDown}
								>Move section down</DropdownMenu.Item
							>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Button
					type="button"
					variant="secondary"
					size="icon"
					title="Delete section"
					disabled={isSaving}
					onclick={async () => {
						try {
							await removeIngredientSection({ recipeId, sectionId: group.id! });
							await onChanged();
						} catch (error) {
							reportError(error);
						}
					}}
				>
					<TrashIcon />
				</Button>
			{/if}
		</div>
	{/if}

	<form
		{...addForm.enhance(async (form) => {
			try {
				if (await form.submit()) {
					form.element.reset();
					await onChanged();
					setTimeout(() => inputRef?.focus(), 50);
				}
			} catch (error) {
				reportError(error);
			}
		})}
		class="flex flex-row items-start gap-2"
	>
		<input {...addForm.fields.recipeId.as('hidden', recipeId)} />
		{#if group.id !== null}<input {...addForm.fields.sectionId.as('hidden', group.id)} />{/if}
		<div class="form-group flex-1">
			<label class="sr-only" for={`ingredient-${group.id ?? 'ungrouped'}`}
				>Add ingredient {group.heading ? `to ${group.heading}` : 'without a section'}</label
			>
			<Input
				id={`ingredient-${group.id ?? 'ungrouped'}`}
				required
				{...addForm.fields.name.as('text')}
				placeholder="Ingredient & Quantity"
				disabled={!!addForm.pending || isSaving}
				bind:ref={inputRef}
			/>
			<FieldIssues issues={addForm.fields.name.issues()} />
		</div>
		<Button
			type="submit"
			size="icon"
			title="Add ingredient"
			disabled={!!addForm.pending || isSaving}><PlusIcon /></Button
		>
	</form>

	<div
		class="flex min-h-10 flex-col gap-2 rounded-md border border-dashed p-2"
		use:dragHandleZone={{
			items: group.items,
			type: 'ingredients',
			flipDurationMs: 150,
			delayTouchStart: true,
			dropTargetStyle: { outline: '2px solid oklch(70.5% 0.213 47.604 / 0.5)' },
			dragDisabled: isSaving
		}}
		onconsider={(event) => handleDnd(event, false)}
		onfinalize={(event) => handleDnd(event, true)}
		aria-label={group.heading ? `${group.heading} ingredient order` : 'Ungrouped ingredient order'}
	>
		{#each group.items as ingredient, index (ingredient.id)}
			<div animate:flip={{ duration: 150 }} aria-label={ingredient.name}>
				<IngredientItem
					{ingredient}
					{recipeId}
					isEditing={editingId === ingredient.id}
					onEditStart={() => onEditStart(ingredient.id)}
					{onEditEnd}
					onSaved={onChanged}
					canMoveUp={index > 0}
					canMoveDown={index < group.items.length - 1}
					{moveTargets}
					onMoveUp={() => onMoveIngredientUp(ingredient.id)}
					onMoveDown={() => onMoveIngredientDown(ingredient.id)}
					onMoveTo={(sectionId) => onMoveIngredientTo(ingredient.id, sectionId)}
					disabled={isSaving}
				/>
				{#if index !== group.items.length - 1}<Separator class="mt-2" />{/if}
			</div>
		{:else}
			<p class="text-muted-foreground py-1 text-center text-xs">Drop ingredients here</p>
		{/each}
	</div>
</section>
