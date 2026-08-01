import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { recipeVisibility } from './recipe-visibility';

const dialect = new PgDialect();
const toSql = (condition: SQL | undefined) =>
	condition ? dialect.sqlToQuery(condition).sql : undefined;

const RELEASED_ONLY = '"recipes"."published_at" is not null';
const DRAFTS_ONLY = '"recipes"."published_at" is null';

describe('recipeVisibility', () => {
	it('should hide drafts when no options are given', () => {
		expect(toSql(recipeVisibility())).toBe(RELEASED_ONLY);
	});

	it('should hide drafts when they are not included', () => {
		expect(toSql(recipeVisibility({ includeDrafts: false }))).toBe(RELEASED_ONLY);
	});

	it('should not filter when drafts are explicitly included', () => {
		expect(toSql(recipeVisibility({ includeDrafts: true }))).toBeUndefined();
	});

	it('should hide released recipes when only drafts are requested', () => {
		expect(toSql(recipeVisibility({ onlyDrafts: true }))).toBe(DRAFTS_ONLY);
	});

	it('should keep only drafts winning over including drafts', () => {
		expect(toSql(recipeVisibility({ onlyDrafts: true, includeDrafts: true }))).toBe(DRAFTS_ONLY);
	});
});
