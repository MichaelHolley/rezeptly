---
name: do-gh-issue
description: Read a GitHub issue via gh CLI, create a feature branch from origin/main, explore the codebase, interview the user on open questions, then implement the changes. Use when user says "do issue", "implement issue", "work on issue N", or provides a GitHub issue number or URL to implement.
---

## Workflow

### 1. Read the issue

```bash
gh issue view <number> --json title,body,labels,comments
```

Parse: goal, acceptance criteria, any linked designs or constraints.

### 2. Create feature branch

Always branch from fresh `origin/main`:

```bash
git fetch origin
git checkout -b <branch-name> origin/main
```

Branch naming: `feat/<issue-number>-<short-slug>` (e.g. `feat/42-recipe-tags`).

### 3. Explore codebase

Before writing any code, locate relevant files.
Understand what already exists before adding anything new.

### 4. Resolve open questions

After exploration, identify unknowns — ambiguous requirements, missing designs, undecided tech choices. **Interview the user** on each one before writing code. Ask all questions in a single message, grouped by topic.

Skip questions with obvious answers from the issue text or codebase conventions.

### 5. Implement

Implement the changes while sticking to the project specific tech-stack, architecture and design decision.

### 6. Verify

```bash
pnpm check
```

All type errors must be resolved before calling the task done.
