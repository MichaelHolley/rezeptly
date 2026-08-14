import type { Instruction } from '$lib/server/types';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import InstructionStep from './InstructionStep.svelte';

const instruction = (overrides: Partial<Instruction> = {}): Instruction => ({
	id: 1,
	heading: 'Prep',
	instructions: 'Chop the onions',
	stepOrder: 1,
	recipeId: 1,
	...overrides
});

describe('InstructionStep.svelte', () => {
	describe('rendering', () => {
		it('should render heading and instructions text', async () => {
			render(InstructionStep, {
				instr: instruction(),
				stepNumber: 1,
				done: false,
				onToggle: () => {}
			});
			await expect.element(page.getByText('Prep')).toBeInTheDocument();
			await expect.element(page.getByText('Chop the onions')).toBeInTheDocument();
		});

		it('should not render a heading button when heading is null', async () => {
			render(InstructionStep, {
				instr: instruction({ heading: null }),
				stepNumber: 1,
				done: false,
				onToggle: () => {}
			});
			await expect.element(page.getByText('Prep')).not.toBeInTheDocument();
		});
	});

	describe('done state', () => {
		it('should show the step number when not done', async () => {
			render(InstructionStep, {
				instr: instruction(),
				stepNumber: 3,
				done: false,
				onToggle: () => {}
			});
			const button = page.getByRole('button', { name: 'Mark step 3 as complete' });
			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveAttribute('aria-pressed', 'false');
			await expect.element(button).toHaveTextContent('3');
		});

		it('should switch label and aria-pressed when done', async () => {
			render(InstructionStep, {
				instr: instruction(),
				stepNumber: 3,
				done: true,
				onToggle: () => {}
			});
			const button = page.getByRole('button', { name: 'Unmark step 3 as complete' });
			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveAttribute('aria-pressed', 'true');
		});
	});

	describe('interaction', () => {
		it('should call onToggle when the step button is clicked', async () => {
			const onToggle = vi.fn();
			render(InstructionStep, {
				instr: instruction(),
				stepNumber: 1,
				done: false,
				onToggle
			});
			await page.getByRole('button', { name: 'Mark step 1 as complete' }).click();
			expect(onToggle).toHaveBeenCalledOnce();
		});

		it('should call onToggle when the heading is clicked', async () => {
			const onToggle = vi.fn();
			render(InstructionStep, {
				instr: instruction(),
				stepNumber: 1,
				done: false,
				onToggle
			});
			await page.getByText('Prep').click();
			expect(onToggle).toHaveBeenCalledOnce();
		});
	});
});
