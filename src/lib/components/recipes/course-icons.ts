import type { RecipeCourse } from '$lib/shared/course';
import CakeSliceIcon from '@lucide/svelte/icons/cake-slice';
import HamburgerIcon from '@lucide/svelte/icons/hamburger';
import SaladIcon from '@lucide/svelte/icons/salad';
import type { Component } from 'svelte';

export const COURSE_ICONS: Record<RecipeCourse, Component<{ class?: string }>> = {
	appetizer: SaladIcon,
	main: HamburgerIcon,
	dessert: CakeSliceIcon
};
