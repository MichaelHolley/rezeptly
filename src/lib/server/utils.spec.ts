import { describe, expect, it } from 'vitest';
import { mapTags } from './utils';

describe('mapTags', () => {
	it('should return an empty array when tags is undefined', () => {
		const result = mapTags(undefined);
		expect(result).toEqual([]);
	});

	it('should return an empty array when tags is an empty array', () => {
		const result = mapTags([]);
		expect(result).toEqual([]);
	});

	it('should map a single tag to an object with name property', () => {
		const result = mapTags(['vegetarian']);
		expect(result).toEqual([{ name: 'vegetarian' }]);
	});

	it('should map multiple tags to objects with name properties', () => {
		const result = mapTags(['vegetarian', 'quick', 'healthy']);
		expect(result).toEqual([{ name: 'vegetarian' }, { name: 'quick' }, { name: 'healthy' }]);
	});

	it('should preserve tag names exactly as provided', () => {
		const result = mapTags(['Tag With Spaces', 'UPPERCASE', 'lowercase']);
		expect(result).toEqual([
			{ name: 'Tag With Spaces' },
			{ name: 'UPPERCASE' },
			{ name: 'lowercase' }
		]);
	});

	it('should handle empty strings in tags array', () => {
		const result = mapTags(['valid', '', 'another']);
		expect(result).toEqual([{ name: 'valid' }, { name: '' }, { name: 'another' }]);
	});
});
