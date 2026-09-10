import { describe, expect, it } from 'vitest';
import { assistantIngredientProposalSchema, listProposalIsStale } from './recipe-assistant';

const groups = [
	{ heading: null, items: ['Salt'] },
	{ heading: 'Sauce', items: ['Tomato'] },
	{ heading: 'Sauce', items: [] }
];

describe('assistant ingredient proposals', () => {
	it('accepts ordered groups, empty sections and duplicate headings', () => {
		expect(
			assistantIngredientProposalSchema.safeParse({ expected: groups, replacement: groups }).success
		).toBe(true);
	});

	it('requires one ungrouped group first', () => {
		expect(
			assistantIngredientProposalSchema.safeParse({
				expected: [{ heading: 'Sauce', items: ['Tomato'] }],
				replacement: groups
			}).success
		).toBe(false);
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
