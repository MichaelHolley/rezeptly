import type { TagProposal } from '../ai.service';
import type { Tag, TagInput } from '../../types';
import { generateSlug } from './generate-slug';

/**
 * Resolves proposed tags against the existing vocabulary on slug + category, adopting the
 * stored name. Unmatched proposals are dropped — a proposal may never create a tag.
 */
export function resolveTags(proposed: TagProposal[], existingTags: Tag[]): TagInput[] {
	const byKey = new Map(existingTags.map((tag) => [`${tag.category}::${tag.slug}`, tag]));

	return proposed.flatMap((proposal) => {
		const slug = generateSlug(proposal.name ?? '');
		if (!slug) return [];

		const match = byKey.get(`${proposal.category}::${slug}`);
		return match ? [{ name: match.name, category: match.category }] : [];
	});
}
