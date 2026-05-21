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
});
