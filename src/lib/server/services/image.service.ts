import { TARGET_IMAGE_WIDTH, BLOB_READ_WRITE_TOKEN, BLOG_STORAGE_DIR } from '$app/env/private';
import { PUBLIC_UPLOAD_ALLOWED_TYPES, PUBLIC_UPLOAD_MAX_BYTES } from '$app/env/public';
import { error } from '@sveltejs/kit';
import { del, put } from '@vercel/blob';
import sharp from 'sharp';

export const validateImageFile = (file: File): void => {
	const allowedTypes = PUBLIC_UPLOAD_ALLOWED_TYPES.split(',');

	if (!allowedTypes.includes(file.type)) {
		error(400, `Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`, {
			code: 'VALIDATION_ERROR'
		});
	}

	if (file.size > PUBLIC_UPLOAD_MAX_BYTES) {
		error(
			400,
			`File is too large. Maximum allowed size is ${(PUBLIC_UPLOAD_MAX_BYTES / (1024 * 1024)).toFixed(1)} MB.`,
			{ code: 'VALIDATION_ERROR' }
		);
	}
};

/**
 * Transforms an image to WebP format and resizes it to the target width while maintaining aspect ratio.
 * Uses Sharp for high-quality image processing.
 *
 * @param file - The image file to transform
 * @returns A Buffer containing the transformed WebP image
 */
const transformImage = async (file: File): Promise<Buffer> => {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	return sharp(buffer)
		.resize(TARGET_IMAGE_WIDTH, null, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.webp({ quality: 80 })
		.toBuffer();
};

export const uploadImage = async (file: File): Promise<string> => {
	validateImageFile(file);

	const transformedBuffer = await transformImage(file);
	const fileName = file.name.replace(/\.[^/.]+$/, '.webp');

	const blob = await put(`${BLOG_STORAGE_DIR}/${fileName}`, transformedBuffer, {
		access: 'public',
		token: BLOB_READ_WRITE_TOKEN,
		contentType: 'image/webp',
		addRandomSuffix: true
	});

	return blob.url;
};

export const deleteImage = async (url: string): Promise<void> => {
	if (!url) return;

	await del(url, { token: BLOB_READ_WRITE_TOKEN });
};
