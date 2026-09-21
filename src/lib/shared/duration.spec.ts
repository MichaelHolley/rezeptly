import { describe, expect, it } from 'vitest';
import { formatDuration } from './duration';

describe('formatDuration', () => {
	it.each([
		[null, null],
		[undefined, null],
		[5, '5 min'],
		[60, '1 h'],
		[90, '1.5 h'],
		[120, '2 h'],
		[180, '3+ h'],
		[75, '75 min']
	])('formats %s as %s', (input, expected) => {
		expect(formatDuration(input)).toBe(expected);
	});
});
