import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import NumberStepper from './NumberStepper.svelte';

describe('NumberStepper.svelte', () => {
	it('should start at min when incremented from empty', async () => {
		const onchange = vi.fn();
		render(NumberStepper, { value: null, onchange, min: 1 });
		await page.getByLabelText('Increase').click();
		expect(onchange).toHaveBeenCalledWith(1);
	});

	it('should disable plus button at max', async () => {
		render(NumberStepper, { value: 99, onchange: vi.fn(), max: 99 });
		await expect.element(page.getByLabelText('Increase')).toBeDisabled();
	});

	it.each([
		['at min', 1],
		['when null', null]
	])('should disable minus button %s', async (_case, value) => {
		render(NumberStepper, { value, onchange: vi.fn(), min: 1 });
		await expect.element(page.getByLabelText('Decrease')).toBeDisabled();
	});
});
