import { env } from '$env/dynamic/private';
import { deleteImage } from '$lib/server/services/image.service';
import { getRecipesMetadata } from '$lib/server/services/recipe.service';
import { json } from '@sveltejs/kit';
import { list } from '@vercel/blob';
import type { RequestHandler } from './$types';

const ORPHAN_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export const GET: RequestHandler = async ({ request }) => {
	// Verify Vercel cron secret for security
	const authHeader = request.headers.get('authorization');
	const cronSecret = env.CRON_SECRET;

	if (!cronSecret) {
		console.error('CRON_SECRET not configured');
		return new Response('Server configuration error', { status: 500 });
	}

	if (authHeader !== `Bearer ${cronSecret}`) {
		console.error('Unauthorized cron request');
		return new Response('Unauthorized', { status: 401 });
	}

	const token = env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		console.error('BLOB_READ_WRITE_TOKEN not configured');
		return new Response('Server configuration error', { status: 500 });
	}

	const storageDir = env.BLOG_STORAGE_DIR;
	if (!storageDir) {
		console.error('BLOG_STORAGE_DIR not configured');
		return new Response('Server configuration error', { status: 500 });
	}

	try {
		const blobs = [];
		let cursor: string | undefined;
		do {
			const page = await list({ token, prefix: `${storageDir.replace(/\/+$/, '')}/`, cursor });
			blobs.push(...page.blobs);
			cursor = page.hasMore ? page.cursor : undefined;
		} while (cursor);

		// Drafts must be included, otherwise their images count as orphaned and get deleted
		const allRecipes = await getRecipesMetadata(undefined, undefined, { includeDrafts: true });
		const dbImageUrls = new Set(allRecipes.map((r) => r.imageUrl).filter(Boolean) as string[]);

		const orphanCutoff = Date.now() - ORPHAN_GRACE_PERIOD_MS;
		const orphanedUrls = blobs
			.filter((blob) => blob.uploadedAt.getTime() <= orphanCutoff && !dbImageUrls.has(blob.url))
			.map((blob) => blob.url);

		console.log(`Found ${orphanedUrls.length} orphaned images to clean up`);

		// Delete orphaned images
		const deletedUrls = [];
		for (const url of orphanedUrls) {
			try {
				await deleteImage(url);
				deletedUrls.push(url);
				console.log(`Deleted orphaned image: ${url}`);
			} catch (error) {
				console.error(`Failed to delete ${url}:`, error);
			}
		}

		console.log(`Cleanup complete: ${deletedUrls.length}/${orphanedUrls.length} images deleted`);

		return json({
			success: true,
			totalBlobs: blobs.length,
			totalRecipeImages: dbImageUrls.size,
			orphanedFound: orphanedUrls.length,
			deleted: deletedUrls.length,
			deletedUrls
		});
	} catch (error) {
		console.error('Error during image cleanup:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
