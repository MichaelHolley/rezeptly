import { env } from '$env/dynamic/private';
import { deleteImage } from '$lib/server/services/image.service';
import { getRecipesMetadata } from '$lib/server/services/recipe.service';
import { json } from '@sveltejs/kit';
import { list } from '@vercel/blob';
import type { RequestHandler } from './$types';

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

	try {
		// Get all blobs from Vercel Blob storage
		const { blobs } = await list({ token });
		const blobUrls = new Set(blobs.map((b) => b.url));

		// Get all image URLs from recipes using recipe service
		const allRecipes = await getRecipesMetadata();
		const dbImageUrls = new Set(allRecipes.map((r) => r.imageUrl).filter(Boolean) as string[]);

		// Find orphaned blobs (in Vercel Blob but not in database)
		const orphanedUrls = [...blobUrls].filter((url) => !dbImageUrls.has(url));

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
