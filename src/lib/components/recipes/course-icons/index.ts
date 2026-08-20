import type { RecipeCourse } from '$lib/shared/course';
import type { Component } from 'svelte';
import AppetizerIcon from './AppetizerIcon.svelte';
import DessertIcon from './DessertIcon.svelte';
import MainCourseIcon from './MainCourseIcon.svelte';

export const COURSE_ICONS: Record<RecipeCourse, Component<{ class?: string }>> = {
	appetizer: AppetizerIcon,
	main: MainCourseIcon,
	dessert: DessertIcon
};
