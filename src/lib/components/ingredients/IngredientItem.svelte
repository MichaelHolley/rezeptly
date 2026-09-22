<script lang="ts">
	import { editIngredient, removeIngredient } from '$lib/api/recipes.remote';
	import FieldIssues from '$lib/components/common/FieldIssues.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { reportError } from '$lib/shared/toast';
	import type { Ingredient } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { dragHandle } from 'svelte-dnd-action';

	type MoveTarget = { id: number | null; name: string };

	const {
		ingredient,
		recipeId,
		isEditing,
		onEditStart,
		onEditEnd,
		onSaved,
		canMoveUp,
		canMoveDown,
		moveTargets,
		onMoveUp,
		onMoveDown,
		onMoveTo,
		disabled = false
	}: {
		ingredient: Ingredient;
		recipeId: number;
		isEditing: boolean;
		onEditStart: () => void;
		onEditEnd: () => void;
		onSaved: () => Promise<void>;
		canMoveUp: boolean;
		canMoveDown: boolean;
		moveTargets: MoveTarget[];
		onMoveUp: () => void;
		onMoveDown: () => void;
		onMoveTo: (sectionId: number | null) => void;
		disabled?: boolean;
	} = $props();

	const editForm = $derived(editIngredient.for(ingredient.id));
	let inputRef = $state<HTMLInputElement | null>(null);
	let editValue = $state(untrack(() => ingredient.name));

	function editItem() {
		editValue = ingredient.name;
		onEditStart();
		setTimeout(() => inputRef?.focus(), 50);
	}

	function cancelEdit() {
		editForm.element?.reset();
		onEditEnd();
	}
</script>

<div class="flex flex-row items-center gap-1" aria-label={ingredient.name}>
	<button
		type="button"
		use:dragHandle
		class="text-muted-foreground hover:text-foreground cursor-grab rounded p-1 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
		aria-label={`Drag ${ingredient.name}`}
		{disabled}
	>
		<GripVerticalIcon />
	</button>
	{#if isEditing}
		<form
			{...editForm.enhance(async ({ submit }) => {
				try {
					if (await submit()) {
						onEditEnd();
						await onSaved();
					}
				} catch (error) {
					reportError(error);
				}
			})}
			class="flex flex-1 flex-row items-start gap-1"
		>
			<input {...editForm.fields.recipeId.as('hidden', recipeId)} />
			<input {...editForm.fields.ingrId.as('hidden', ingredient.id)} />
			<div class="form-group flex-1">
				<Input
					required
					{...editForm.fields.name.as('text')}
					bind:value={editValue}
					bind:ref={inputRef}
					disabled={!!editForm.pending}
					class="text-sm"
					onkeydown={(event) => {
						event.stopPropagation();
						if (event.key === 'Escape') cancelEdit();
					}}
				/>
				<FieldIssues issues={editForm.fields.name.issues()} />
			</div>
			<Button
				type="submit"
				variant="ghost"
				size="icon-sm"
				disabled={!!editForm.pending}
				title="Save ingredient"
			>
				<CheckIcon />
			</Button>
			<Button type="button" variant="ghost" size="icon-sm" onclick={cancelEdit} title="Cancel edit">
				<XIcon />
			</Button>
		</form>
	{:else}
		<button
			class="flex-1 cursor-pointer px-1 text-left text-sm"
			onclick={editItem}
			title="Edit ingredient"
		>
			{ingredient.name}
		</button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
				aria-label={`Move ${ingredient.name}`}
				{disabled}
			>
				<MoreHorizontalIcon />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item disabled={!canMoveUp} onSelect={onMoveUp}>Move up</DropdownMenu.Item>
					<DropdownMenu.Item disabled={!canMoveDown} onSelect={onMoveDown}
						>Move down</DropdownMenu.Item
					>
					{#if moveTargets.length > 0}
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Move to section</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<DropdownMenu.Group>
									{#each moveTargets as target (`${target.id}`)}
										<DropdownMenu.Item onSelect={() => onMoveTo(target.id)}>
											{target.name}
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Group>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					{/if}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Button
			variant="secondary"
			type="button"
			size="icon-sm"
			title="Delete ingredient"
			{disabled}
			onclick={async () => {
				try {
					await removeIngredient({ recipeId, ingrId: ingredient.id });
					await onSaved();
				} catch (error) {
					reportError(error);
				}
			}}
		>
			<TrashIcon />
		</Button>
	{/if}
</div>
