import { PUBLIC_UPLOAD_ALLOWED_TYPES } from '$app/env/public';

export const DEFAULT_UPLOAD_ALLOWED_TYPES = 'image/jpeg,image/png,image/webp';
export const getUploadAllowedTypes = (): string =>
	PUBLIC_UPLOAD_ALLOWED_TYPES || DEFAULT_UPLOAD_ALLOWED_TYPES;
