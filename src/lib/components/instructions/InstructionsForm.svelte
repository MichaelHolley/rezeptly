<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import StepForm from './StepForm.svelte';

	export interface Step {
		heading: string | null;
		description: string;
	}

	let { steps = $bindable() } = $props<{
		steps: Step[];
	}>();

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
</script>

<div class="flex flex-col gap-8">
	{#each steps as step, i}
		<div class="flex flex-row gap-2">
			<div class="grow">
				<StepForm
					bind:heading={step.heading}
					bind:description={step.description}
					onRemove={() => removeStep(i)}
					key={i}
				/>
			</div>
			<div class="flex flex-col items-center justify-center gap-1">
				<Button variant="outline" onclick={() => moveUp(i)} disabled={i == 0}>
					<ChevronUpIcon />
				</Button>
				{i + 1}
				<Button variant="outline" onclick={() => moveDown(i)} disabled={i == steps.length - 1}>
					<ChevronDownIcon />
				</Button>
			</div>
		</div>
	{/each}
</div>

<div class="mt-4 flex flex-row justify-between gap-2">
	<div></div>
	<Button onclick={addStep} variant="outline">
		<PlusIcon />
		Add Step
	</Button>
	<Button type="submit">
		<CheckIcon />
		Save
	</Button>
</div>
