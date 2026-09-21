import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	deleteImage: vi.fn(),
	getRecipesMetadata: vi.fn(),
	list: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		BLOG_STORAGE_DIR: 'recipes',
		BLOB_READ_WRITE_TOKEN: 'blob-token',
		CRON_SECRET: 'cron-secret'
	}
}));
vi.mock('$lib/server/services/image.service', () => ({ deleteImage: mocks.deleteImage }));
vi.mock('$lib/server/services/recipe.service', () => ({
	getRecipesMetadata: mocks.getRecipesMetadata
}));
vi.mock('@vercel/blob', () => ({ list: mocks.list }));

import { GET } from './+server';

describe('cleanup images cron', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('paginates the configured directory and deletes only old unattached images', async () => {
		const oldOrphan = {
			url: 'https://blob.example/recipes/old.webp',
			uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
		};
		const recentOrphan = {
			url: 'https://blob.example/recipes/recent.webp',
			uploadedAt: new Date()
		};
		const attached = {
			url: 'https://blob.example/recipes/attached.webp',
			uploadedAt: oldOrphan.uploadedAt
		};

		mocks.list
			.mockResolvedValueOnce({ blobs: [oldOrphan, recentOrphan], hasMore: true, cursor: 'next' })
			.mockResolvedValueOnce({ blobs: [attached], hasMore: false });
		mocks.getRecipesMetadata.mockResolvedValue([{ imageUrl: attached.url }]);

		const response = await GET({
			request: new Request('http://localhost/api/cron/cleanup-images', {
				headers: { authorization: 'Bearer cron-secret' }
			})
		} as Parameters<typeof GET>[0]);

		expect(mocks.list).toHaveBeenNthCalledWith(1, {
			token: 'blob-token',
			prefix: 'recipes/',
			cursor: undefined
		});
		expect(mocks.list).toHaveBeenNthCalledWith(2, {
			token: 'blob-token',
			prefix: 'recipes/',
			cursor: 'next'
		});
		expect(mocks.deleteImage).toHaveBeenCalledExactlyOnceWith(oldOrphan.url);
		expect(await (response as Response).json()).toMatchObject({
			totalBlobs: 3,
			orphanedFound: 1,
			deleted: 1
		});
	});
});
