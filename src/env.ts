import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

const required = { schema: z.string().min(1) };
const optional = { schema: z.string().optional() };
const positiveInt = (fallback: number) =>
	z.coerce.number<string>().int().positive().default(fallback);

export const variables = defineEnvVars({
	JWT_SECRET: { ...required, static: true },
	AUTH_PASSWORD: { ...required, static: true },
	DATABASE_URL: required,
	CRON_SECRET: required,
	BLOB_READ_WRITE_TOKEN: required,
	BLOG_STORAGE_DIR: required,
	TARGET_IMAGE_WIDTH: { schema: positiveInt(800) },
	OPENROUTER_API_KEY: optional,
	OPENROUTER_MODEL_NAME: optional,
	PUBLIC_UPLOAD_ALLOWED_TYPES: {
		schema: z.string().min(1).default('image/jpeg,image/png,image/webp'),
		public: true
	},
	PUBLIC_UPLOAD_MAX_BYTES: { schema: positiveInt(5 * 1024 * 1024), public: true }
});
