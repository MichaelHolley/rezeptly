import { describe, expect, it } from 'vitest';
import { recipeVisibility } from './recipe-visibility';

describe('recipeVisibility', () => {
	it('should filter when no options are given', () => {
		expect(recipeVisibility()).toBeDefined();
	});

	it('should filter when drafts are not included', () => {
		expect(recipeVisibility({ includeDrafts: false })).toBeDefined();
	});

	it('should not filter when drafts are explicitly included', () => {
		expect(recipeVisibility({ includeDrafts: true })).toBeUndefined();
	});

	it('should filter when only drafts are requested', () => {
		expect(recipeVisibility({ onlyDrafts: true })).toBeDefined();
	});

	it('should keep filtering when only drafts wins over including drafts', () => {
		expect(recipeVisibility({ onlyDrafts: true, includeDrafts: true })).toBeDefined();
	});
});
