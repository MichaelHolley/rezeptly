# Agent Guidelines for rezeptly

## Build & Test Commands

- **Dev**: `pnpm dev` - starts dev server at localhost:5173
- **Build**: `pnpm build` - builds for production
- **Lint**: `pnpm lint` - runs prettier check and eslint
- **Format**: `pnpm format` - formats code with prettier
- **Type-check**: `pnpm check` - runs svelte-check with TypeScript
- **Database**: `pnpm db:start` (Docker), `pnpm db:push` (schema changes)
- **No test suite currently exists** - verify changes manually in dev mode

## Code Style

- **Formatting**: Tabs for indentation, single quotes, no trailing commas, 100 char line width
- **Imports**: Group by external libs, then $lib aliases, then relative paths
- **Types**: Use TypeScript strict mode; import types from `$lib/server/types`
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **Components**: Use Svelte 5 runes (`$props`, `$state`, `$derived`) not legacy stores
- **Error Handling**: Use try-catch blocks; log errors with `console.error()`
- **Database**: Use Drizzle ORM with transactions for multi-step operations
- **Services**: Keep business logic in `$lib/server/services/`, database queries in services not routes
- **Comments**: Minimal comments; code should be self-documenting

## Commit Messages

- **Format**: Follow Conventional Commits specification with prefixes: `feat:`, `fix:`, `chore:`
- **Examples**:
  - `feat: update Notify button color`
  - `fix: resolve recipe search pagination`
  - `chore: update dependencies`
  - `feat: add recipe sharing functionality`

## Remote Functions Pattern

- **Location**: Define in `$lib/api/*.remote.ts` files
- **Types**: Use `query()` for reads, `command()` for JS calls, `form()` for form submissions
- **Validation**: All remote functions use Zod schemas for input validation
- **Usage in Components**: Import and call with `.enhance()` for forms or directly for commands/queries
- **Refreshing Data**: Call `.refresh()` on queries after mutations to update UI
- **Example**: `export const getRecipes = query(async () => recipeService.getRecipes());`
- **Form Actions**: For complex form handling, use traditional SvelteKit form actions in `+page.server.ts`

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
