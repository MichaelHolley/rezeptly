<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import StepForm from './StepForm.svelte';

	export interface Step {
		heading: string;
		description: string;
	}

	let { steps = $bindable() } = $props<{
		steps: Step[];
	}>();

	const addStep = () => (steps = [...steps, { heading: '', description: '' }]);

	const removeStep = (index: number) => {
		steps = (steps as Step[]).filter((_, i) => i !== index);
	};
</script>

<div class="flex flex-col gap-8">
	{#each steps as step, i}
		<div class="flex flex-row gap-2">
			<div class="grow">
				<StepForm
					bind:heading={step.heading}
					bind:description={step.description}
					step={i + 1}
					onRemove={() => removeStep(i)}
				/>
			</div>
			<div></div>
		</div>
	{/each}
	<div class="flex flex-row justify-center">
		<Button onclick={addStep}>
			<PlusIcon />
			Add Step
		</Button>
	</div>
</div>
