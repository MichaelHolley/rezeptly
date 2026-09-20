import { describe, expect, it } from 'vitest';
import { parseInstruction } from './parse-instruction';

describe('parseInstruction', () => {
	it('should parse unordered and ordered lists', () => {
		expect(parseInstruction('- Chop the onions\n1. Heat the pan')).toEqual([
			{ type: 'unordered-list', items: [{ text: 'Chop the onions' }] },
			{ type: 'ordered-list', items: [{ text: 'Heat the pan' }], start: 1 }
		]);
	});
});
