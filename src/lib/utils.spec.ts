import { describe, expect, it } from 'vitest';
import { sanitizeViewTransitionName } from './utils';

describe('sanitizeViewTransitionName', () => {
	it('should return undefined for undefined input', () => {
		const result = sanitizeViewTransitionName(undefined);
		expect(result).toBeUndefined();
	});

	it('should preserve valid CSS identifiers', () => {
		expect(sanitizeViewTransitionName('valid-name')).toBe('valid-name');
		expect(sanitizeViewTransitionName('valid_name')).toBe('valid_name');
		expect(sanitizeViewTransitionName('validName123')).toBe('validName123');
	});

	it('should replace emojis with hyphens', () => {
		expect(sanitizeViewTransitionName('🍕 pizza')).toBe('pizza');
		expect(sanitizeViewTransitionName('healthy 🥗')).toBe('healthy');
		expect(sanitizeViewTransitionName('🍕')).toBe('tag');
	});

	it('should replace spaces with hyphens', () => {
		expect(sanitizeViewTransitionName('tag with spaces')).toBe('tag-with-spaces');
	});

	it('should replace special characters with hyphens', () => {
		expect(sanitizeViewTransitionName('tag@#$%')).toBe('tag');
		expect(sanitizeViewTransitionName('tag!name')).toBe('tag-name');
	});

	it('should collapse multiple consecutive hyphens', () => {
		expect(sanitizeViewTransitionName('tag---name')).toBe('tag-name');
		expect(sanitizeViewTransitionName('tag   name')).toBe('tag-name');
	});

	it('should handle names starting with digits', () => {
		expect(sanitizeViewTransitionName('123tag')).toBe('_123tag');
		expect(sanitizeViewTransitionName('9test')).toBe('_9test');
	});

	it('should handle names starting with hyphen followed by digit', () => {
		expect(sanitizeViewTransitionName('-5tag')).toBe('_5tag');
	});

	it('should remove leading and trailing hyphens', () => {
		expect(sanitizeViewTransitionName('-tag-')).toBe('tag');
		expect(sanitizeViewTransitionName('---tag---')).toBe('tag');
	});

	it('should return "tag" for empty or invalid results', () => {
		expect(sanitizeViewTransitionName('!@#$%')).toBe('tag');
		expect(sanitizeViewTransitionName('   ')).toBe('tag');
		expect(sanitizeViewTransitionName('---')).toBe('tag');
	});

	it('should handle complex emoji combinations', () => {
		expect(sanitizeViewTransitionName('🍕🌮🍔 fast food')).toBe('fast-food');
		expect(sanitizeViewTransitionName('healthy 🥗🥑🍓 recipes')).toBe('healthy-recipes');
	});
});
