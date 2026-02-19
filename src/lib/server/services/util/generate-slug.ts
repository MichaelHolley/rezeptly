import slugify from 'slugify';

export function generateSlug(title: string): string | undefined {
	const slug = slugify(title, { lower: true, strict: true });

	if (!slug) return undefined;

	return slug;
}
