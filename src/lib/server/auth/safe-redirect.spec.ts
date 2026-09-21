import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
	it.each([
		[undefined, '/'],
		['https://example.com/phishing', '/'],
		['//example.com/phishing', '/'],
		['///[', '/'],
		['/\\example.com/phishing', '/'],
		['/create?from=login#details', '/create?from=login#details']
	])('maps %s to %s', (value, expected) => {
		expect(safeRedirectPath(value)).toBe(expected);
	});
});
