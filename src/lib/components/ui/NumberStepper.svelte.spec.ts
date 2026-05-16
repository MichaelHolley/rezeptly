import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import NumberStepper from './NumberStepper.svelte';

describe('NumberStepper.svelte', () => {
	describe('rendering', () => {
		it('should render label when provided', async () => {
			render(NumberStepper, { value: null, onchange: vi.fn(), label: 'Portions' });
			await expect.element(page.getByText('Portions')).toBeInTheDocument();
		});

		it('should render empty input when value is null', async () => {
			render(NumberStepper, { value: null, onchange: vi.fn() });
			const input = page.getByRole('textbox');
			await expect.element(input).toHaveValue('');
		});

		it('should render value in input', async () => {
			render(NumberStepper, { value: 4, onchange: vi.fn() });
			const input = page.getByRole('textbox');
			await expect.element(input).toHaveValue('4');
		});
	});

	describe('increment', () => {
		it('should start at min when incremented from empty', async () => {
			const onchange = vi.fn();
			render(NumberStepper, { value: null, onchange, min: 1 });
			await page.getByLabelText('Increase').click();
			expect(onchange).toHaveBeenCalledWith(1);
		});

		it('should increment current value by 1', async () => {
			const onchange = vi.fn();
			render(NumberStepper, { value: 3, onchange });
			await page.getByLabelText('Increase').click();
			expect(onchange).toHaveBeenCalledWith(4);
		});

		it('should disable plus button at max', async () => {
			render(NumberStepper, { value: 99, onchange: vi.fn(), max: 99 });
			await expect.element(page.getByLabelText('Increase')).toBeDisabled();
		});
	});

	describe('decrement', () => {
		it('should decrement current value by 1', async () => {
			const onchange = vi.fn();
			render(NumberStepper, { value: 4, onchange });
			await page.getByLabelText('Decrease').click();
			expect(onchange).toHaveBeenCalledWith(3);
		});

		it('should disable minus button at min', async () => {
			render(NumberStepper, { value: 1, onchange: vi.fn(), min: 1 });
			await expect.element(page.getByLabelText('Decrease')).toBeDisabled();
		});

		it('should disable minus button when null', async () => {
			render(NumberStepper, { value: null, onchange: vi.fn() });
			await expect.element(page.getByLabelText('Decrease')).toBeDisabled();
		});
	});
});
