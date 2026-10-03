import type { Instruction } from '$lib/server/types';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import InstructionStep from './InstructionStep.svelte';

const instr: Instruction = {
	id: 1,
	heading: 'Prep',
	instructions: 'Chop the onions',
	stepOrder: 1,
	recipeId: 1
};

describe('InstructionStep.svelte', () => {
	it('should toggle from both the step button and the heading', async () => {
		const onToggle = vi.fn();
		render(InstructionStep, { instr, stepNumber: 3, done: false, onToggle });

		const button = page.getByRole('button', { name: 'Mark step 3 as complete' });
		await expect.element(button).toHaveAttribute('aria-pressed', 'false');
		await button.click();
		await page.getByText('Prep').click();

		expect(onToggle).toHaveBeenCalledTimes(2);
	});

	it('should expose the done state', async () => {
		render(InstructionStep, { instr, stepNumber: 3, done: true, onToggle: () => {} });

		await expect
			.element(page.getByRole('button', { name: 'Unmark step 3 as complete' }))
			.toHaveAttribute('aria-pressed', 'true');
	});
});
