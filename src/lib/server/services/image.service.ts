import { del, put } from '@vercel/blob';
import { env } from '$env/dynamic/private';

const getAllowedTypes = () => {
	const types = env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp';
	return types.split(',');
};

const getMaxSize = () => parseInt(env.UPLOAD_MAX_SIZE || '512000');
const getMaxDimensions = () => parseInt(env.MAX_IMAGE_DIMENSIONS || '1200');
const getTargetWidth = () => parseInt(env.TARGET_IMAGE_WIDTH || '800');

export const getUploadConfig = () => ({
	allowedTypes: getAllowedTypes(),
	maxSize: getMaxSize(),
	maxDimensions: getMaxDimensions(),
	targetWidth: getTargetWidth()
});

export const validateImageFile = (file: File): void => {
	const allowedTypes = getAllowedTypes();
	const maxSize = getMaxSize();

	if (!allowedTypes.includes(file.type)) {
		throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
	}

	if (file.size > maxSize) {
		throw new Error(`File size exceeds maximum of ${maxSize / 1000}KB`);
	}
};

export const uploadImage = async (file: File): Promise<string> => {
	validateImageFile(file);

	const token = env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
	}

	const blob = await put(file.name, file, {
		access: 'public',
		token
	});

	return blob.url;
};

export const deleteImage = async (url: string): Promise<void> => {
	if (!url) return;

	const token = env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		console.error('BLOB_READ_WRITE_TOKEN is not configured');
		return;
	}

	try {
		await del(url, { token });
	} catch (error) {
		console.error('Failed to delete image from Vercel Blob:', error);
	}
};
