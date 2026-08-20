import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CoursePickerComponent from './CoursePickerComponent.svelte';

describe('CoursePickerComponent.svelte', () => {
	describe('rendering', () => {
		it('should render a card per course', async () => {
			render(CoursePickerComponent, { value: null });

			await expect.element(page.getByRole('button', { name: 'Appetizer' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Main Course' })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Dessert' })).toBeInTheDocument();
		});

		it('should mark the current value as pressed', async () => {
			render(CoursePickerComponent, { value: 'dessert' });

			await expect
				.element(page.getByRole('button', { name: 'Dessert' }))
				.toHaveAttribute('aria-pressed', 'true');
			await expect
				.element(page.getByRole('button', { name: 'Appetizer' }))
				.toHaveAttribute('aria-pressed', 'false');
		});
	});

	describe('interaction', () => {
		it('should select the clicked course', async () => {
			render(CoursePickerComponent, { value: null });

			await page.getByRole('button', { name: 'Main Course' }).click();

			await expect
				.element(page.getByRole('button', { name: 'Main Course' }))
				.toHaveAttribute('aria-pressed', 'true');
		});

		it('should clear the value when the selected course is clicked again', async () => {
			render(CoursePickerComponent, { value: 'appetizer' });

			await page.getByRole('button', { name: 'Appetizer' }).click();

			await expect
				.element(page.getByRole('button', { name: 'Appetizer' }))
				.toHaveAttribute('aria-pressed', 'false');
		});
	});
});
