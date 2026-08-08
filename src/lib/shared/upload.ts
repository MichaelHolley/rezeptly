import { env as publicEnv } from '$env/dynamic/public';

export const DEFAULT_UPLOAD_ALLOWED_TYPES = 'image/jpeg,image/png,image/webp';

export const getUploadAllowedTypes = (): string =>
	publicEnv.PUBLIC_UPLOAD_ALLOWED_TYPES || DEFAULT_UPLOAD_ALLOWED_TYPES;
