import { isNotNull, isNull, type SQL } from 'drizzle-orm';
import { recipes } from '../../db/schema';

export type ReadOptions = {
	includeDrafts?: boolean;
	onlyDrafts?: boolean;
};

/**
 * Fail-closed visibility predicate shared by every recipe read path: a caller that passes
 * nothing gets released recipes only, so an omission hides drafts instead of leaking them.
 */
export const recipeVisibility = (options?: ReadOptions): SQL | undefined => {
	if (options?.onlyDrafts) {
		return isNull(recipes.publishedAt);
	}

	return options?.includeDrafts ? undefined : isNotNull(recipes.publishedAt);
};
