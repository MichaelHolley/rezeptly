import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CopyButtonComponent from './CopyButtonComponent.svelte';

describe('CopyButtonComponent.svelte', () => {
	let writeText: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText } });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('should use the label as the accessible name', async () => {
		render(CopyButtonComponent, { value: 'hello', label: 'Copy link' });
		await expect.element(page.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
	});

	it('should write the value to the clipboard on click', async () => {
		render(CopyButtonComponent, { value: 'hello world' });
		await page.getByRole('button', { name: 'Copy' }).click();
		expect(writeText).toHaveBeenCalledWith('hello world');
	});

	it('should reset the copied state after the timeout', async () => {
		vi.useFakeTimers();
		render(CopyButtonComponent, { value: 'hello', label: 'Copy' });

		await page.getByRole('button', { name: 'Copy' }).click();
		expect(writeText).toHaveBeenCalledOnce();

		vi.advanceTimersByTime(2000);
		await expect.element(page.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
	});
});
