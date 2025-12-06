import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoadingComponent from './LoadingComponent.svelte';

describe('LoadingComponent.svelte', () => {
	describe('rendering', () => {
		it('should render the loading icon', () => {
			const { container } = render(LoadingComponent);

			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
		});

		it('should have spin animation class', () => {
			const { container } = render(LoadingComponent);

			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('animate-spin')).toBe(true);
		});
	});

	describe('styling', () => {
		it('should apply custom className', () => {
			const { container } = render(LoadingComponent, {
				class: 'custom-loading-class'
			});

			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('custom-loading-class')).toBe(true);
		});

		it('should preserve default classes when custom class is applied', () => {
			const { container } = render(LoadingComponent, {
				class: 'custom-class'
			});

			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('animate-spin')).toBe(true);
			expect(svg?.classList.contains('custom-class')).toBe(true);
		});

		it('should apply size-4 class and check component dimensions', () => {
			const { container } = render(LoadingComponent, {
				class: 'size-4'
			});

			const svg = container.querySelector('svg') as SVGElement;
			expect(svg?.classList.contains('size-4')).toBe(true);

			// Get computed style to check actual dimensions
			const computedStyle = window.getComputedStyle(svg);
			const width = computedStyle.width;
			const height = computedStyle.height;

			// size-4 in Tailwind is 1rem (16px)
			expect(width).toBe('16px');
			expect(height).toBe('16px');
		});

		it('should apply multiple custom classes', () => {
			const { container } = render(LoadingComponent, {
				class: 'size-8 text-blue-500'
			});

			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-8')).toBe(true);
			expect(svg?.classList.contains('text-blue-500')).toBe(true);
		});
	});
});
