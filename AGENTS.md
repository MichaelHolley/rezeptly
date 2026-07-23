# Agent Guidelines for rezeptly

## Commands

Commands and Scripts are defined in the `package.json` file. Prefer scripts over `pnpx` or `npx` commands.

## Coding Guidelines

- **Components**: Use Svelte 5 runes (`$props`, `$state`, `$derived`) not legacy stores.
- **Styling**: Tailwind CSS (v4) with `clsx` and `tailwind-merge` for dynamic classes
- **Database**: Use Drizzle ORM with transactions for multi-step operations. Use `pnpm db:push` for rapid prototyping and `pnpm db:generate` for production migrations. Migration files must be generated. Hand-edits require approval.
- **Services**: Keep business logic in `$lib/server/services/`, database queries in services not routes, and blob/file side effects in services too.
- **Architecture**: Keep routes and remote functions thin; put validation at the boundary and refresh remote queries after mutations.
- **Comments**: Minimal comments; code should be self-documenting

## Documentation

- Changes to MCP tools must be covered and updated in the routes/(app)/mcp page.

### Code-Comments

- Only add comments to functions when the logic is non-obvious and a reader would need context beyond the function name and types to understand it.
- Skip comments on straightforward functions — well-named identifiers are sufficient.
- When a comment is warranted, use JSDoc syntax.
- Keep documentation comments short and concise.

## Remote Functions Pattern

- **Location**: Define in `$lib/api/*.remote.ts` files
- **Validation**: All remote functions use Zod schemas for input validation
- **Usage in Components**: Import and call with `.enhance()` for forms or directly for commands/queries
- **Refreshing Data**: Call `.refresh()` on queries after mutations to update UI

## Feedback Loop

Making changes to the codebase requires validation via `pnpm check`. All issues must be resolved before continuing.
