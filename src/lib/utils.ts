import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function sanitizeViewTransitionName(name: string | undefined): string | undefined {
	if (!name) return undefined;

	// Convert string to valid CSS identifier by:
	// 1. Replacing any non-alphanumeric characters (including emojis) with hyphens
	// 2. Ensuring it doesn't start with a digit or hyphen followed by digit
	// 3. Collapsing multiple consecutive hyphens into one
	const sanitized = name
		.replace(/[^a-zA-Z0-9-_]/g, '-')
		.replace(/^(\d)/, '_$1')
		.replace(/^-(\d)/, '_$1')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');

	return sanitized || 'tag';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
