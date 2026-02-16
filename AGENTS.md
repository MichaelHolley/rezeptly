# Agent Guidelines for rezeptly

## Build & Test Commands

- **Dev**: `pnpm dev` - starts dev server at localhost:5173
- **Build**: `pnpm build` - builds for production
- **Lint**: `pnpm lint` - runs prettier check and eslint
- **Format**: `pnpm format` - formats code with prettier
- **Type-check**: `pnpm check` - runs svelte-check with TypeScript
- **Database**: `pnpm db:start` (Docker), `pnpm db:push` (schema changes), `pnpm db:generate` (new migration)
- **Test**: `pnpm test` - runs vitest unit tests once
- **Unit Test**: `pnpm test:unit` - runs vitest in watch mode

## Code Style

- **Formatting**: Tabs for indentation, single quotes, no trailing commas, 100 char line width
- **Imports**: Group by external libs, then $lib aliases, then relative paths
- **Types**: Use TypeScript strict mode; import types from `$lib/server/types`
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **Components**: Use Svelte 5 runes (`$props`, `$state`, `$derived`) not legacy stores. Organize by feature in `$lib/components/<feature>/`.
- **Icons**: Use `@lucide/svelte` for iconography
- **Styling**: Tailwind CSS (v4) with `clsx` and `tailwind-merge` for dynamic classes
- **Error Handling**: Throw custom error classes from `$lib/server/errors` (e.g., `NotFoundError`, `ValidationError`). The global `handleError` hook manages logging and client responses. Use try-catch only for local recovery logic.
- **Database**: Use Drizzle ORM with transactions for multi-step operations. Use `pnpm db:push` for rapid prototyping and `pnpm db:generate` for production migrations.
- **Services**: Keep business logic in `$lib/server/services/`, database queries in services not routes
- **Comments**: Minimal comments; code should be self-documenting

## Environment Variables

- **Local Setup**: Copy `.env.example` to `.env` and fill in required values. NEVER commit `.env` files.
- **Vercel**: Use Vercel Dashboard for production environment variables.

## Documentation

- **External Docs**: Use `context7` mcp tools for searching and querying up-to-date documentation for libraries and frameworks. Always call `resolve-library-id` first to get the correct ID before using `query-docs`.

## Remote Functions Pattern

- **Location**: Define in `$lib/api/*.remote.ts` files
- **Types**: Use `query()` for reads, `command()` for JS calls, `form()` for form submissions
- **Validation**: All remote functions use Zod schemas for input validation
- **Usage in Components**: Import and call with `.enhance()` for forms or directly for commands/queries
- **Refreshing Data**: Call `.refresh()` on queries after mutations to update UI
- **Example**: `export const getRecipes = query(async () => recipeService.getRecipes());`
- **Form Actions**: For complex form handling, use traditional SvelteKit form actions in `+page.server.ts`
