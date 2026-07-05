export const DURATION_BUCKETS = [5, 15, 30, 45, 60, 90, 120, 180] as const;
export type DurationBucket = (typeof DURATION_BUCKETS)[number];

export function formatDuration(minutes: number | null | undefined): string | null {
	if (minutes == null) return null;
	switch (minutes) {
		case 60:
			return '1 h';
		case 90:
			return '1.5 h';
		case 120:
			return '2 h';
		case 180:
			return '3+ h';
		default:
			return `${minutes} min`;
	}
}
