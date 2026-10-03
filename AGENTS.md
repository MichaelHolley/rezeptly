# Agent Guidelines for rezeptly

## Commands

Commands and Scripts are defined in the `package.json` file. Prefer scripts over `pnpx` or `npx` commands.

- **Env files**: In a worktree without a `.env`, copy `.env.example` to `.env` and fill in the values needed for testing.

## Coding Guidelines

- **Components**: Use Svelte 5 runes (`$props`, `$state`, `$derived`).
- **UI Library**: svelte-shadcn provides most of the shadcn components, stored in `src/lib/components/ui/`. Prefer these over building custom components.
- **Styling**: Tailwind CSS (v4) with `clsx` and `tailwind-merge` for dynamic classes.
- **Database**: Use Drizzle ORM with transactions for multi-step operations. Use `pnpm db:push` for rapid prototyping and `pnpm db:generate` for production migrations. Migration files must be generated. Hand-edits require approval.
- **Services**: Keep business logic in `$lib/server/services/`, database queries in services not routes, and blob/file side effects in services too.
- **Architecture**: Keep routes and remote functions thin; put validation at the boundary and refresh remote queries after mutations.
- **Cron jobs**: Background jobs live in `src/routes/api/cron/` and are scheduled in `vercel.json`.
- **Comments**: Minimal comments; code should be self-documenting

## Routing & Auth

- **`(app)` scope**: All authenticated routes live in `src/routes/(app)/`. Put new authenticated routes there.
- **Protected routes**: Add the pathname to `protectedRoutes` in `src/hooks.server.ts`. The `handleAuth` hook redirects unauthenticated visitors to `/auth?returnTo=…` before any load runs — do not re-check auth in a `+page.server.ts`.
- **Shared route data**: `src/routes/(app)/+layout.server.ts` supplies `features` to every route in the scope. Pages inherit it through `data`, so a `+page.server.ts` that only re-exposes the same value is redundant.
- **Write permission**: Enforce per mutation with `userCanWrite()` in the remote function. The hook checks authentication, not role.

## Documentation

- Prefer clear, concise, short instructions over excessive text.

### Code-Comments

- Only add comments to functions when the logic is non-obvious and a reader would need context beyond the function name and types to understand it.
- Skip comments on straightforward functions — well-named identifiers are sufficient.
- When a comment is warranted, use JSDoc syntax.
- Keep documentation comments short and concise.

## Remote Functions Pattern

- **Location**: Define in `$lib/api/*.remote.ts` files
- **Validation**: All remote functions use Zod schemas for input validation
- **Shared Schemas**: `$lib/api/schemas.ts` holds schemas used by more than one remote function — entity ids (`recipeIdSchema`, `ingredientIdSchema`, `tagIdSchema`) and repeated field groups (`recipeDetailsSchema`). Reuse these rather than redefining them, and add new shared definitions there.
- **Entity Ids**: The id schemas parse to branded types (`RecipeId`, `IngredientId`, `TagId`, re-exported from `$lib/server/types`). Type service parameters with the brand, not `number`, so a mismatched id fails to compile. Inputs stay unbranded, so callers still pass plain numbers and form strings.
- **Usage in Components**: Import and call with `.enhance()` for forms or directly for commands/queries
- **Refreshing Data**: Call `.refresh()` on queries after mutations to update UI

## AI Schemas

- **Describe every property**: Put `.describe()` on each field of a tool `inputSchema` or `Output.object` schema. Field-level rules belong in the schema, not the system prompt — the model reads them while filling the JSON.
- **Partial updates**: Apply only explicit changes as a partial write. For model-facing schemas, use field/value entries when nullable optional properties could be populated with `null`; reserve `null` for an explicit request to clear a field.

## Testing

Test behavior that can break **silently**: auth and redirects, validation at the boundary, draft/published visibility, and parsing or normalizing data. Each behavior has one **owner**: an e2e flow or a unit/component test, never both.

- **Naming**: Test files are `*.spec.ts`, colocated with their source. Component and rune-module tests are `*.svelte.spec.ts`.
- **Red**: Every assertion can go red when its behavior breaks. One test may assert several facets of the same behavior.
- **Tables**: Cases that differ only in input share one `it.each` table.
- **E2E**: Only core flows get e2e coverage in `e2e/`: auth, and creating, editing, publishing and finding recipes. A new feature adds e2e only when it is a new core flow; admin-only management pages (e.g. `/tags`) never are.
- **Unit**: Pure logic in the categories above.
- **Component**: Only for logic e2e doesn't reach: state transitions, bounds, submitted form values. Markup, prop pass-through and framework behavior (`bind:value`, `$state` assignment) are covered by the type checker and the framework.
- **AI features**: Leave untested — real calls cost money and turn flaky.
- **Services**: `*.service.ts` files stay untested — e2e covers them. Pure helpers in `services/util/` are unit-tested.
- **Removals**: Removing a feature removes or updates its tests. Deleted behavior needs no regression test.

## Feedback Loop

Making changes to the codebase requires validation via `pnpm check`. All issues must be resolved before continuing.

- `pnpm test:e2e <spec>` is self-contained (Docker test DB + preview build); pass one spec to run just it.
