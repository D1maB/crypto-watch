# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

`crypto-watch` — a JavaScript application for tracking cryptocurrency prices and portfolios.

## Stack

- Runtime: Node.js (ES modules)
- Language: JavaScript (clean, readable, modern ES2022+)
- Package manager: npm
- Testing: Vitest (preferred) or Jest
- Linting/formatting: ESLint + Prettier

## Conventions

### Code style

- Use `const`/`let`; never `var`.
- Prefer `async`/`await` over `.then()` chains.
- Keep functions small and single-purpose; name them verb-first (`fetchPrice`, `formatAmount`).
- Prefer pure functions; isolate side effects at module boundaries.
- Validate inputs at public boundaries; trust internal callers.
- Avoid magic numbers/strings — extract named constants.
- No dead code, no commented-out blocks, no `console.log` in committed code (use a logger).
- Prefer early returns over deep nesting.
- Use template literals for string building.

### File layout

```
src/
  index.js          # entry point
  config/           # env & constants
  services/         # external API clients (exchange, price feeds)
  domain/           # pure business logic
  utils/            # generic helpers
tests/              # mirrors src/ structure
```

### Naming

- Files: `kebab-case.js`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Booleans: prefix `is`, `has`, `should`, `can`

### Commits (Conventional Commits)

Format: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

- Subject: imperative mood, lowercase, no trailing period, ≤ 72 chars.
- Body: explain *why*, not *what*; wrap at 72 chars.
- One logical change per commit; keep commits atomic.
- Reference issues in footer: `Closes #123`.

Examples:
- `feat(prices): add CoinGecko price fetcher`
- `fix(portfolio): correct PnL calculation for short positions`
- `test(utils): add coverage for formatAmount`

### Branches

- `main` is protected; feature work on `feat/<short-name>`, fixes on `fix/<short-name>`.

### Testing

- Every new public function gets a test.
- Tests describe behavior, not implementation.
- Mock external I/O; never hit real networks in tests.

### Security

- Never commit secrets; use `.env` (gitignored) + `.env.example`.
- Validate and sanitize all external input.
- Pin dependency versions; audit before adding.

### Agent workflow

1. Read this file and `README.md` before making changes.
2. Explore first (`grep`/`glob`) — understand before editing.
3. Make the smallest change that solves the task.
4. Run lint + tests before committing.
5. Commit with a conventional message; do not push unless asked.
6. Never edit generated files or `node_modules`.
7. Ask before destructive operations (force push, reset --hard, deleting branches).

### Don'ts

- Don't rewrite unrelated code "while you're there".
- Don't add dependencies without justification.
- Don't disable lint rules inline without a comment explaining why.
- Don't commit `console.log`, debugger statements, or temp files.
