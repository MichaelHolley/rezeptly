import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CoursePickerComponent from './CoursePickerComponent.svelte';

describe('CoursePickerComponent.svelte', () => {
	it('should clear the value when the selected course is clicked again', async () => {
		render(CoursePickerComponent, { value: 'appetizer' });

		await page.getByRole('button', { name: 'Appetizer' }).click();

		await expect
			.element(page.getByRole('button', { name: 'Appetizer' }))
			.toHaveAttribute('aria-pressed', 'false');
	});
});
