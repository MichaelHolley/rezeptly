import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

const optional = { schema: z.string().optional() };

export const variables = defineEnvVars({
	JWT_SECRET: { static: true },
	AUTH_PASSWORD: { static: true },
	DATABASE_URL: {},
	CRON_SECRET: optional,
	BLOB_READ_WRITE_TOKEN: optional,
	BLOG_STORAGE_DIR: optional,
	TARGET_IMAGE_WIDTH: optional,
	OPENROUTER_API_KEY: optional,
	OPENROUTER_MODEL_NAME: optional,
	PUBLIC_UPLOAD_ALLOWED_TYPES: { ...optional, public: true },
	PUBLIC_UPLOAD_MAX_BYTES: { ...optional, public: true }
});
