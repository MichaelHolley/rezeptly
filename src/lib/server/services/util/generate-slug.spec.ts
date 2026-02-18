import { describe, expect, it } from 'vitest';
import { generateSlug } from './generate-slug';

describe('generateSlug', () => {
	describe('basic formatting', () => {
		it('should convert to lowercase', () => {
			expect(generateSlug('Recipe Name')).toBe('recipe-name');
		});

		it('should replace spaces with dashes', () => {
			expect(generateSlug('recipe name')).toBe('recipe-name');
		});

		it('should trim whitespace', () => {
			expect(generateSlug('  recipe name  ')).toBe('recipe-name');
		});
	});

	describe('character handling', () => {
		it('should remove special characters', () => {
			expect(generateSlug('Recipe @ Name!')).toBe('recipe-name');
		});

		it('should handle multiple spaces and dashes', () => {
			expect(generateSlug('Recipe   Name---New')).toBe('recipe-name-new');
		});

		it('should handle non-latin characters', () => {
			expect(generateSlug('Récipé')).toBe('recipe');
		});

		it('should handle german umlaute', () => {
			expect(generateSlug('Äpfel Öfen Übermorgen')).toBe('apfel-ofen-ubermorgen');
		});
	});

	describe('edge cases', () => {
		it('should return undefined for empty input', () => {
			expect(generateSlug('')).toBeUndefined();
		});

		it('should return undefined for only special characters', () => {
			expect(generateSlug('!!!(')).toBeUndefined();
		});
	});
});
