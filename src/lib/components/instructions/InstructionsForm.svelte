<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import StepForm from './StepForm.svelte';

	export interface Step {
		heading: string;
		description: string;
	}

	let { steps = $bindable() } = $props<{
		steps: Step[];
	}>();

	const addStep = () => (steps = [...steps, { heading: '', description: '' }]);

	const removeStep = (index: number) => (steps = (steps as Step[]).splice(index, 1)); // TODO: fix
</script>

<div class="flex flex-col gap-8">
	{#each steps as step, i}
		<StepForm
			bind:heading={step.heading}
			bind:description={step.description}
			step={i + 1}
			onRemove={() => removeStep(i)}
		/>
	{/each}
	<Button onclick={addStep}>+ Add Step</Button>
</div>
