import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import BreadcrumbComponent from './BreadcrumbComponent.svelte';

describe('BreadcrumbComponent.svelte', () => {
	describe('rendering', () => {
		it('should always render Home link', async () => {
			render(BreadcrumbComponent, { breadcrumbs: [] });

			const homeLink = page.getByText('Home');
			await expect.element(homeLink).toBeInTheDocument();
		});

		it('should render Home link with correct href', async () => {
			const { container } = render(BreadcrumbComponent, { breadcrumbs: [] });

			const homeLink = container.querySelector('a[href="/"]');
			expect(homeLink).toBeTruthy();
			expect(homeLink?.textContent).toBe('Home');
		});

		it('should render without breadcrumbs when not provided', async () => {
			const { container } = render(BreadcrumbComponent);

			const homeLink = page.getByText('Home');
			await expect.element(homeLink).toBeInTheDocument();

			const separators = container.querySelectorAll('li svg');
			expect(separators.length).toBe(0);
		});

		it('should render breadcrumbs when provided', async () => {
			const breadcrumbs = [
				{ name: 'Recipes', href: '/recipes' },
				{ name: 'Italian', href: '/recipes/italian' }
			];

			render(BreadcrumbComponent, { breadcrumbs });

			const recipesLink = page.getByText('Recipes');
			await expect.element(recipesLink).toBeInTheDocument();

			const italianLink = page.getByText('Italian');
			await expect.element(italianLink).toBeInTheDocument();
		});

		it('should render single breadcrumb', async () => {
			const breadcrumbs = [{ name: 'Recipes', href: '/recipes' }];

			render(BreadcrumbComponent, { breadcrumbs });

			const recipesLink = page.getByText('Recipes');
			await expect.element(recipesLink).toBeInTheDocument();

			const homeLink = page.getByText('Home');
			await expect.element(homeLink).toBeInTheDocument();
		});
	});

	describe('breadcrumb links', () => {
		it('should render breadcrumb with href', async () => {
			const breadcrumbs = [{ name: 'Recipes', href: '/recipes' }];

			const { container } = render(BreadcrumbComponent, { breadcrumbs });

			const recipesLink = container.querySelector('a[href="/recipes"]');
			expect(recipesLink).toBeTruthy();
			expect(recipesLink?.textContent).toContain('Recipes');
		});

		it('should render breadcrumb without href', async () => {
			const breadcrumbs = [{ name: 'Current Page' }];

			render(BreadcrumbComponent, { breadcrumbs });

			const currentPageLink = await page.getByText('Current Page');
			await expect.element(currentPageLink).toBeInTheDocument();
		});

		it('should render multiple breadcrumbs with correct order', async () => {
			const breadcrumbs = [
				{ name: 'Recipes', href: '/recipes' },
				{ name: 'Italian', href: '/recipes/italian' },
				{ name: 'Pasta', href: '/recipes/italian/pasta' }
			];

			const { container } = render(BreadcrumbComponent, { breadcrumbs });

			const links = container.querySelectorAll('a');
			expect(links.length).toBe(4); // Home + 3 breadcrumbs
			expect(links[0].textContent).toBe('Home');
			expect(links[1].textContent).toContain('Recipes');
			expect(links[2].textContent).toContain('Italian');
			expect(links[3].textContent).toContain('Pasta');
		});
	});

	describe('separators', () => {
		it('should render separators between breadcrumbs', async () => {
			const breadcrumbs = [
				{ name: 'Recipes', href: '/recipes' },
				{ name: 'Italian', href: '/recipes/italian' }
			];

			const { container } = render(BreadcrumbComponent, { breadcrumbs });

			// There should be 2 separators: one after Home, one after Recipes
			const separators = container.querySelectorAll('li svg');
			expect(separators.length).toBe(2);
		});

		it('should render correct number of separators with single breadcrumb', async () => {
			const breadcrumbs = [{ name: 'Recipes', href: '/recipes' }];

			const { container } = render(BreadcrumbComponent, { breadcrumbs });

			// There should be 1 separator: one after Home
			const separators = container.querySelectorAll('li svg');
			expect(separators.length).toBe(1);
		});

		it('should not render separators when no breadcrumbs provided', async () => {
			const { container } = render(BreadcrumbComponent, { breadcrumbs: [] });

			const separators = container.querySelectorAll('li svg');
			expect(separators.length).toBe(0);
		});
	});

	describe('special characters', () => {
		it('should handle breadcrumb names with special characters', async () => {
			const breadcrumbs = [
				{ name: 'Café & Crème', href: '/recipes/cafe' },
				{ name: "Chef's Special", href: '/recipes/special' }
			];

			render(BreadcrumbComponent, { breadcrumbs });

			const cafeLink = page.getByText('Café & Crème');
			await expect.element(cafeLink).toBeInTheDocument();

			const specialLink = page.getByText("Chef's Special");
			await expect.element(specialLink).toBeInTheDocument();
		});

		it('should handle breadcrumb with unicode characters', async () => {
			const breadcrumbs = [{ name: '🍝 Pasta Recipes', href: '/pasta' }];

			render(BreadcrumbComponent, { breadcrumbs });

			const pastaLink = page.getByText('🍝 Pasta Recipes');
			await expect.element(pastaLink).toBeInTheDocument();
		});
	});
});
