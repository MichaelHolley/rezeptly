const LOCAL_ORIGIN = 'http://localhost';

export const safeRedirectPath = (value?: string): string => {
	if (!value?.startsWith('/')) return '/';

	try {
		const url = new URL(value, LOCAL_ORIGIN);
		return url.origin === LOCAL_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : '/';
	} catch {
		return '/';
	}
};
