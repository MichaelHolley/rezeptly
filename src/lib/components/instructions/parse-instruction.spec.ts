import { describe, expect, it } from 'vitest';
import { parseInstruction } from './parse-instruction';

describe('parseInstruction', () => {
	it('should preserve prose and unsupported Markdown', () => {
		expect(parseInstruction('Mix gently\n**Do not whisk**\n<script>alert(1)</script>')).toEqual([
			{ type: 'prose', text: 'Mix gently\n**Do not whisk**\n<script>alert(1)</script>' }
		]);
	});

	it('should group indented unordered items', () => {
		expect(parseInstruction('  - Chop the onions\n\t- Heat the pan')).toEqual([
			{
				type: 'unordered-list',
				items: [{ text: 'Chop the onions' }, { text: 'Heat the pan' }]
			}
		]);
	});

	it('should preserve the first ordered marker and ignore later marker values', () => {
		expect(parseInstruction('3. Add flour\n8. Add water')).toEqual([
			{
				type: 'ordered-list',
				start: 3,
				items: [{ text: 'Add flour' }, { text: 'Add water' }]
			}
		]);
	});

	it('should separate lists at marker changes and blank lines', () => {
		expect(parseInstruction('Before\n- One\n1. First\n\n2. Second\nAfter')).toEqual([
			{ type: 'prose', text: 'Before' },
			{ type: 'unordered-list', items: [{ text: 'One' }] },
			{ type: 'ordered-list', start: 1, items: [{ text: 'First' }] },
			{ type: 'prose', text: '' },
			{ type: 'ordered-list', start: 2, items: [{ text: 'Second' }] },
			{ type: 'prose', text: 'After' }
		]);
	});
});
