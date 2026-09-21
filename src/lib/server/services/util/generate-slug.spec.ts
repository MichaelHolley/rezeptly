import { describe, expect, it } from 'vitest';
import { generateSlug } from './generate-slug';

describe('generateSlug', () => {
	it.each([
		['  Recipe   Name---New  ', 'recipe-name-new'],
		['Recipe @ Name!', 'recipe-name'],
		['Récipé', 'recipe'],
		['Äpfel Öfen Übermorgen', 'apfel-ofen-ubermorgen'],
		['', undefined],
		['!!!(', undefined]
	])('generates %s as %s', (title, expected) => {
		expect(generateSlug(title)).toBe(expected);
	});
});
