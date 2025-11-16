<script lang="ts">
	import { updateInstructions } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { RecipeWithDetails } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import { onMount } from 'svelte';
	import { Textarea } from '../ui/textarea';

	export interface Step {
		heading: string | null;
		description: string;
	}

	const {
		recipe,
		onSave
	}: {
		recipe: RecipeWithDetails;
		onSave?: () => void;
	} = $props();

	let steps = $state<Step[]>([]);

	onMount(() => {
		steps = getStepsFromRecipe();
	});

	const addStep = () => (steps = [...steps, { heading: '', description: '' }]);

	const removeStep = (index: number) => {
		steps = (steps as Step[]).filter((_, i) => i !== index);
	};

	const moveUp = (i: number) => {
		if (i === 0) return;

		[steps[i - 1], steps[i]] = [steps[i], steps[i - 1]];
	};

	const moveDown = (i: number) => {
		if (i === steps.length - 1) return;

		[steps[i + 1], steps[i]] = [steps[i], steps[i + 1]];
	};

	const getStepsFromRecipe = () => {
		return [...recipe.instructions]
			.sort((a, b) => a.stepOrder - b.stepOrder)
			.map((instruction) => ({
				heading: instruction.heading,
				description: instruction.instructions
			}));
	};
</script>

<form
	{...updateInstructions.enhance(async ({ submit }) => {
		try {
			await submit();
			onSave?.();
		} catch (error) {
			console.error(error);
		}
	})}
>
	<Input {...updateInstructions.fields.recipeId.as('hidden', String(recipe.id))} />

	<div class="flex flex-col gap-8">
		{#each steps as step, i}
			<div class="flex flex-col gap-2">
				<div class="flex flex-row gap-2">
					<div class="flex grow flex-col gap-2">
						<div class="flex flex-row items-center justify-between gap-2">
							<Input
								{...updateInstructions.fields.instructions[i].heading.as('text')}
								value={step.heading}
								placeholder="Short, descriptive heading"
							/>
							<Button variant="secondary" onclick={() => removeStep(i)} title="Remove step">
								<TrashIcon />
							</Button>
						</div>
						<Textarea
							placeholder="Start by describing the step in detail..."
							required
							{...updateInstructions.fields.instructions[i].instructions.as('text')}
							value={step.description}
						/>
					</div>
					<div class="flex flex-col items-center justify-center gap-1">
						<Button
							variant="outline"
							onclick={() => moveUp(i)}
							disabled={i == 0}
							title="Swap with previous step"
						>
							<ChevronUpIcon />
						</Button>
						{i + 1}
						<Button
							variant="outline"
							onclick={() => moveDown(i)}
							disabled={i == steps.length - 1}
							title="Swap with next step"
						>
							<ChevronDownIcon />
						</Button>
					</div>
				</div>
			</div>
		{/each}

		<div class="mt-4 flex flex-row justify-between gap-2">
			<div></div>
			<Button onclick={addStep} variant="outline" type="button">
				<PlusIcon />
				Add Step
			</Button>
			<Button type="submit">
				<CheckIcon />
				Save
			</Button>
		</div>
	</div>
</form>
