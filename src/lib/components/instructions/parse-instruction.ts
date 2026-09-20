type InstructionItem = { text: string };

export type InstructionBlock =
	| { type: 'prose'; text: string }
	| { type: 'unordered-list'; items: InstructionItem[] }
	| { type: 'ordered-list'; items: InstructionItem[]; start: number };

export function parseInstruction(instructions: string): InstructionBlock[] {
	const blocks: InstructionBlock[] = [];

	for (const line of instructions.split(/\r?\n/)) {
		const unorderedItem = line.match(/^[ \t]*- (.*)$/);
		const orderedItem = line.match(/^[ \t]*(\d+)\. (.*)$/);
		const previousBlock = blocks.at(-1);

		if (unorderedItem) {
			if (previousBlock?.type === 'unordered-list') {
				previousBlock.items.push({ text: unorderedItem[1] });
			} else {
				blocks.push({ type: 'unordered-list', items: [{ text: unorderedItem[1] }] });
			}
		} else if (orderedItem) {
			if (previousBlock?.type === 'ordered-list') {
				previousBlock.items.push({ text: orderedItem[2] });
			} else {
				blocks.push({
					type: 'ordered-list',
					items: [{ text: orderedItem[2] }],
					start: Number(orderedItem[1])
				});
			}
		} else if (previousBlock?.type === 'prose') {
			previousBlock.text += `\n${line}`;
		} else {
			blocks.push({ type: 'prose', text: line });
		}
	}

	return blocks;
}
