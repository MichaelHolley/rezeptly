import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BreadcrumbComponent from './BreadcrumbComponent.svelte';

describe('BreadcrumbComponent.svelte', () => {
	it('renders the Home link without breadcrumbs', () => {
		const { container } = render(BreadcrumbComponent, { breadcrumbs: [] });

		expect(container.querySelector('a')?.textContent).toBe('Home');
		expect(container.querySelector('a')?.getAttribute('href')).toBe('/');
		expect(container.querySelectorAll('li svg')).toHaveLength(0);
	});

	it('renders ordered breadcrumb links and separators', () => {
		const { container } = render(BreadcrumbComponent, {
			breadcrumbs: [
				{ name: 'Recipes', href: '/recipes' },
				{ name: 'Café & Crème', href: '/recipes/cafe' },
				{ name: "Chef's Special", href: '/recipes/special' }
			]
		});

		expect(
			[...container.querySelectorAll('a')].map((link) => [
				link.textContent,
				link.getAttribute('href')
			])
		).toEqual([
			['Home', '/'],
			['Recipes', '/recipes'],
			['Café & Crème', '/recipes/cafe'],
			["Chef's Special", '/recipes/special']
		]);
		expect(container.querySelectorAll('li svg')).toHaveLength(3);
	});
});
