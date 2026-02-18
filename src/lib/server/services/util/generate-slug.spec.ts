import { describe, expect, it } from 'vitest';
import { generateSlug } from './generate-slug';

describe('generateSlug', () => {
	it('should convert to lowercase', () => {
		expect(generateSlug('Recipe Name')).toBe('recipe-name');
	});

	it('should replace spaces with dashes', () => {
		expect(generateSlug('recipe name')).toBe('recipe-name');
	});

	it('should remove special characters', () => {
		expect(generateSlug('Recipe @ Name!')).toBe('recipe-name');
	});

	it('should handle multiple spaces and dashes', () => {
		expect(generateSlug('Recipe   Name---New')).toBe('recipe-name-new');
	});

	it('should handle non-latin characters according to slugify strict mode', () => {
		expect(generateSlug('Récipé')).toBe('recipe');
	});

	it('should handle german umlaute', () => {
		expect(generateSlug('Äpfel Öfen Übermorgen')).toBe('apfel-ofen-ubermorgen');
	});

	it('should return an empty string for empty input', () => {
		expect(generateSlug('')).toBe('');
	});

	it('should trim whitespace', () => {
		expect(generateSlug('  recipe name  ')).toBe('recipe-name');
	});
});
