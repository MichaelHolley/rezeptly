import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoadingComponent from './LoadingComponent.svelte';

describe('LoadingComponent.svelte', () => {
	describe('rendering', () => {
		it('should render with status role', () => {
			const { container } = render(LoadingComponent);

			const status = container.querySelector('[role="status"]');
			expect(status).toBeTruthy();
		});

		it('should render an icon', () => {
			const { container } = render(LoadingComponent);

			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
		});

		it('should render a screen reader label', () => {
			const { container } = render(LoadingComponent);

			const srOnly = container.querySelector('.sr-only');
			expect(srOnly?.textContent).toBe('Loading...');
		});
	});

	describe('styling', () => {
		it('should apply default classes to the wrapper', () => {
			const { container } = render(LoadingComponent);

			const wrapper = container.querySelector('[role="status"]');
			expect(wrapper?.classList.contains('size-10')).toBe(true);
		});

		it('should apply custom className to the wrapper', () => {
			const { container } = render(LoadingComponent, {
				class: 'custom-loading-class'
			});

			const wrapper = container.querySelector('[role="status"]');
			expect(wrapper?.classList.contains('custom-loading-class')).toBe(true);
		});

		it('should preserve default classes when custom class is applied', () => {
			const { container } = render(LoadingComponent, {
				class: 'custom-class'
			});

			const wrapper = container.querySelector('[role="status"]');
			expect(wrapper?.classList.contains('size-10')).toBe(true);
			expect(wrapper?.classList.contains('custom-class')).toBe(true);
		});

		it('should apply multiple custom classes', () => {
			const { container } = render(LoadingComponent, {
				class: 'size-8 text-blue-500'
			});

			const wrapper = container.querySelector('[role="status"]');
			expect(wrapper?.classList.contains('size-8')).toBe(true);
			expect(wrapper?.classList.contains('text-blue-500')).toBe(true);
		});
	});
});
