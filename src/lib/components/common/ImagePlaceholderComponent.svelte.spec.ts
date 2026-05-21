import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import ImagePlaceholderComponent from './ImagePlaceholderComponent.svelte';

describe('ImagePlaceholderComponent.svelte', () => {
	describe('default variant', () => {
		it('should render "No preview" label', async () => {
			render(ImagePlaceholderComponent);
			await expect.element(page.getByText('No preview')).toBeInTheDocument();
		});
	});

	describe('empty variant', () => {
		it('should render "No preview" label', async () => {
			render(ImagePlaceholderComponent, { variant: 'empty' });
			await expect.element(page.getByText('No preview')).toBeInTheDocument();
		});
	});

	describe('broken variant', () => {
		it('should render "Preview broken" label', async () => {
			render(ImagePlaceholderComponent, { variant: 'broken' });
			await expect.element(page.getByText('Preview broken')).toBeInTheDocument();
		});
	});
});
