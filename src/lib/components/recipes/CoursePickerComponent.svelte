<script lang="ts">
	import { COURSE_LABELS, COURSES, type RecipeCourse } from '$lib/shared/course';
	import { cn } from '$lib/utils';
	import { COURSE_ICONS } from './course-icons';

	let { value = $bindable() }: { value: RecipeCourse | null } = $props();

	const labelId = $props.id();

	const toggle = (course: RecipeCourse) => {
		value = value === course ? null : course;
	};
</script>

<div class="flex flex-col gap-2">
	<span id={labelId} class="text-sm font-medium">Course</span>
	<div role="group" aria-labelledby={labelId} class="flex flex-row flex-wrap gap-2">
		{#each COURSES as course (course)}
			{@const Icon = COURSE_ICONS[course]}
			<button
				type="button"
				aria-pressed={value === course}
				onclick={() => toggle(course)}
				class={cn(
					'flex w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center text-xs font-medium transition-colors',
					value === course
						? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
						: 'text-muted-foreground hover:bg-accent'
				)}
			>
				<Icon class="size-8" />
				{COURSE_LABELS[course]}
			</button>
		{/each}
	</div>
</div>
