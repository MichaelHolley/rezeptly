---
name: write-tests
description:
  Write Vitest tests for this codebase. Covers pure utils, Svelte 5 components, and Svelte stores.
  Use when asked to write, add, or generate tests.
---

## Setup

**Stack:** Vitest + `vitest-browser-svelte` + `@vitest/browser`
**Run:** `pnpm test` (run-once) · `pnpm test:unit` (watch)
**File convention:** co-locate spec files — `foo.spec.ts` next to `foo.ts` / `foo.svelte`

## Best practices

**Test behavior, not implementation**
Assert what the user sees or what the function returns — not internal state, class names, or DOM structure.

**Prefer semantic selectors**
`page.getByRole`, `page.getByText`, `page.getByLabelText` over `querySelector`. Selectors tied to CSS classes or DOM structure break on refactors.

**One assertion per concept**
Each `it` block tests one behavior. Multiple `expect` calls are fine when they describe the same concept (e.g. both `isLoggedIn` and `canEdit` after a role change).

**Name tests as specifications**
`it('should return undefined for empty input')` — not `it('empty string test')`.

**Group with `describe`**
Top-level: the subject. Nested: the scenario (`rendering`, `interaction`, `edge cases`, `happy path`). Avoid over-nesting beyond two levels.

**Cover edge cases explicitly**
Empty input, null/undefined, boundary values, special characters. Pure functions especially — they're cheap to test exhaustively.

**Don't assert CSS classes**
Tailwind class names are implementation details. If you need to verify styling-driven behavior, test the visible effect (disabled state, text content, aria attribute) instead.

**Use `beforeEach` for store resets**
Stores with global state must reset between tests to prevent cross-test pollution.

**No mocking the DB**
Integration tests hit real services. Only mock at the boundary of the unit under test (e.g. `onchange` callbacks with `vi.fn()`).

**Don't test constants**
Asserting that `TAG_CATEGORIES` contains `['type', 'cuisine', ...]` tests the data, not behavior. Only test code that transforms or makes decisions.
