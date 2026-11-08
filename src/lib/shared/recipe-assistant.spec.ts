import { describe, expect, it } from 'vitest';
import { assistantIngredientProposalSchema, listProposalIsStale } from './recipe-assistant';

const groups = [
	{ heading: null, items: ['Salt'] },
	{ heading: 'Sauce', items: ['Tomato'] },
	{ heading: 'Sauce', items: [] }
];

describe('assistant ingredient proposals', () => {
	it.each([
		['accepts ordered groups, empty sections and duplicate headings', groups, true],
		['allows omitting the ungrouped group', [{ heading: 'Sauce', items: ['Tomato'] }], true],
		[
			'rejects an ungrouped group after a section',
			[
				{ heading: 'Sauce', items: ['Tomato'] },
				{ heading: null, items: ['Salt'] }
			],
			false
		]
	])('%s', (_, expected, success) => {
		expect(
			assistantIngredientProposalSchema.safeParse({ expected, replacement: groups }).success
		).toBe(success);
	});

	it('detects structural changes even when ingredient names are unchanged', () => {
		expect(
			listProposalIsStale(groups, [
				{ heading: null, items: ['Salt', 'Tomato'] },
				{ heading: 'Sauce', items: [] },
				{ heading: 'Sauce', items: [] }
			])
		).toBe(true);
	});
});
