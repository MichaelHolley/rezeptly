import { describe, expect, it } from 'vitest';
import { formatDuration } from './duration';

describe('formatDuration', () => {
	describe('null / undefined input', () => {
		it('should return null for null', () => {
			expect(formatDuration(null)).toBeNull();
		});

		it('should return null for undefined', () => {
			expect(formatDuration(undefined)).toBeNull();
		});
	});

	describe('known buckets', () => {
		it('should format 15 as "15 min"', () => {
			expect(formatDuration(15)).toBe('15 min');
		});

		it('should format 30 as "30 min"', () => {
			expect(formatDuration(30)).toBe('30 min');
		});

		it('should format 45 as "45 min"', () => {
			expect(formatDuration(45)).toBe('45 min');
		});

		it('should format 60 as "1 h"', () => {
			expect(formatDuration(60)).toBe('1 h');
		});

		it('should format 90 as "1.5 h"', () => {
			expect(formatDuration(90)).toBe('1.5 h');
		});

		it('should format 120 as "2 h"', () => {
			expect(formatDuration(120)).toBe('2 h');
		});

		it('should format 180 as "3+ h"', () => {
			expect(formatDuration(180)).toBe('3+ h');
		});
	});

	describe('arbitrary values', () => {
		it('should fall back to "X min" for unknown values', () => {
			expect(formatDuration(20)).toBe('20 min');
			expect(formatDuration(75)).toBe('75 min');
		});
	});
});
