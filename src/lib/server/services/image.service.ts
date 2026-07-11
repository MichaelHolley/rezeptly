import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import { del, put } from '@vercel/blob';
import sharp from 'sharp';

const getAllowedTypes = () => {
	const types = publicEnv.PUBLIC_UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp';
	return types.split(',');
};

const getTargetWidth = () => parseInt(env.TARGET_IMAGE_WIDTH || '800');

export const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const getMaxUploadBytes = (): number => {
	const parsed = parseInt(publicEnv.PUBLIC_UPLOAD_MAX_BYTES || '', 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_UPLOAD_BYTES;
};

export const validateImageFile = (file: File): void => {
	const allowedTypes = getAllowedTypes();

	if (!allowedTypes.includes(file.type)) {
		error(400, {
			message: `Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`,
			code: 'VALIDATION_ERROR'
		});
	}

	const maxBytes = getMaxUploadBytes();
	if (file.size > maxBytes) {
		error(400, {
			message: `File is too large. Maximum allowed size is ${(maxBytes / (1024 * 1024)).toFixed(1)} MB.`,
			code: 'VALIDATION_ERROR'
		});
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
	const targetWidth = getTargetWidth();
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	return sharp(buffer)
		.resize(targetWidth, null, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.webp({ quality: 80 })
		.toBuffer();
};

export const uploadImage = async (file: File): Promise<string> => {
	validateImageFile(file);

	const token = env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		error(500, {
			message: 'BLOB_READ_WRITE_TOKEN is not set',
			code: 'CONFIGURATION_ERROR'
		});
	}

	const blogStorageDir = env.BLOG_STORAGE_DIR;
	if (!blogStorageDir) {
		error(500, {
			message: 'BLOG_STORAGE_DIR is not set',
			code: 'CONFIGURATION_ERROR'
		});
	}

	const transformedBuffer = await transformImage(file);
	const fileName = file.name.replace(/\.[^/.]+$/, '.webp');

	const blob = await put(`${blogStorageDir}/${fileName}`, transformedBuffer, {
		access: 'public',
		token,
		contentType: 'image/webp',
		addRandomSuffix: true
	});

	return blob.url;
};

export const deleteImage = async (url: string): Promise<void> => {
	if (!url) return;

	const token = env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		error(500, {
			message: 'BLOB_READ_WRITE_TOKEN is not set',
			code: 'CONFIGURATION_ERROR'
		});
	}

	await del(url, { token });
};
