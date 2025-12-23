import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { del, put } from '@vercel/blob';
import sharp from 'sharp';
import { ConfigurationError, ValidationError } from '../errors';

const getAllowedTypes = () => {
	const types = publicEnv.PUBLIC_UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp';
	return types.split(',');
};

const getTargetWidth = () => parseInt(env.TARGET_IMAGE_WIDTH || '800');

const validateImageFile = (file: File): void => {
	const allowedTypes = getAllowedTypes();

	if (!allowedTypes.includes(file.type)) {
		throw new ValidationError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
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
		throw new ConfigurationError('BLOB_READ_WRITE_TOKEN is not configured');
	}

	const transformedBuffer = await transformImage(file);
	const fileName = file.name.replace(/\.[^/.]+$/, '.webp');

	const blob = await put(fileName, transformedBuffer, {
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
		throw new ConfigurationError('BLOB_READ_WRITE_TOKEN is not configured');
	}

	await del(url, { token });
};
