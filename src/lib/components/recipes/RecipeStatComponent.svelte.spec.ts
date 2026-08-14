import ClockIcon from '@lucide/svelte/icons/clock';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import RecipeStat from './RecipeStatComponent.svelte';

describe('RecipeStatComponent.svelte', () => {
	it('should render the label and a string value', async () => {
		render(RecipeStat, { icon: ClockIcon, label: 'Total', value: '45 min' });
		await expect.element(page.getByText('Total')).toBeInTheDocument();
		await expect.element(page.getByText('45 min')).toBeInTheDocument();
	});

	it('should render a numeric value', async () => {
		render(RecipeStat, { icon: ClockIcon, label: 'Portions', value: 4 });
		await expect.element(page.getByText('4')).toBeInTheDocument();
	});

	it('should render the icon', async () => {
		const { container } = render(RecipeStat, { icon: ClockIcon, label: 'Total', value: '45 min' });
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('should render nothing for the value when null', async () => {
		render(RecipeStat, { icon: ClockIcon, label: 'Total', value: null });
		await expect.element(page.getByText('Total')).toBeInTheDocument();
	});
});
