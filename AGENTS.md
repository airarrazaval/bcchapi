# AGENTS.md

Guidelines for AI agents working on this codebase.

---

## Project Overview

A Node.js library template. ESM-only, targets Node.js >=24. TypeScript is the only supported language.

## File Structure

```text
src/
  index.ts              # library entry point — re-exports all public symbols
  client/               # HTTP client, error types, API response types
  series/               # curated BCCH series ID constants
  utils/                # observation transforms (toNumbers, fillForward, …) and stats (mean, stdDev, …)
  cache/                # Cache interface and MemoryCache implementation
tests/                  # mirrors src/ — one test file per source file
tsconfig.json           # type-checking config (covers src/ + tests/, noEmit: true)
tsconfig.build.json     # build config (src/ only, emits to dist/)
typedoc.json            # TypeDoc config (generates docs/)
cliff.toml              # git-cliff config (changelog generation from Conventional Commits)
.oxlintrc.json          # oxlint rules config
.oxfmtrc.json           # oxfmt formatting config (printWidth, tabWidth, quotes, etc.)
dist/                   # compiled output — generated, not committed
docs/                   # generated API docs — not committed
```

Each `src/` subdirectory is a subpath export (`bcchapi/client`, `bcchapi/series`, `bcchapi/utils`, `bcchapi/cache`). The dependency direction is: `client` → `cache` (for types), `utils` → `client` (for the `Observation` type only). `series` and `cache` are standalone with no cross-module dependencies.

- `src/` contains library code only. Never import `node:test` or test utilities from `src/`.
- `tests/` mirrors the `src/` structure. One test file per source file.
- `dist/` and `docs/` are build artefacts. Never edit them by hand.

## Core Principles — Agent Directives

You are an AI agent operating in a strictly **Test Driven Development (TDD)** environment. You must follow these steps in order, without exception.

**STEP 1 — CLARIFY.** Read the requirements. If inputs, outputs, error states, or edge cases are ambiguous, **STOP. Ask the user. Do not guess.**

Stop and ask if any of the following are missing or unclear:

- **Purpose** — what the function/feature does and why it exists
- **Inputs** — types, valid ranges, edge cases, what constitutes invalid input
- **Outputs** — return type and shape on success
- **Error cases** — what can go wrong and what should be thrown or returned
- **Constraints** — performance requirements, API compatibility, allowed dependencies
- **Public API surface** — which symbols are exported and part of the contract

> "Before I proceed, I need clarification on [specific question]. What should happen when [edge case]?"

Only proceed once requirements are unambiguous.

**STEP 2 — TEST.** Write failing tests in `tests/` that encode the requirements. Run them — they must fail.

**STEP 3 — IMPLEMENT.** Write the minimum code in `src/` to make the failing tests pass. No more.

**STEP 4 — REFACTOR.** Clean up the code while keeping the test suite green.

**CRITICAL: Never write implementation code without a failing test driving it.**

## Commands

```sh
npm run dev            # run tests in watch mode (use during development)
npm run build          # compile src/ → dist/
npm run typecheck      # type-check without emitting
npm test               # run tests
npm run check          # format + typecheck + lint + test (run before committing)
npm run test:coverage  # run tests with coverage
npm run lint           # lint src/ and tests/
npm run lint:fix       # lint and auto-fix
npm run format         # format all files
npm run format:check   # check formatting
npm run docs           # generate API docs → docs/
npm run clean          # remove dist/ and docs/
npm run changelog      # regenerate CHANGELOG.md from commits (run before releasing)
```

Always run `npm run format` then `npm run check` after making changes.

---

## TypeScript Style ([ts.dev/style](https://ts.dev/style))

Follow [ts.dev/style](https://ts.dev/style). Most rules (no `var`, strict equality, no `any`, etc.) are enforced by oxlint — violations will fail CI. The conventions below are **not caught by tooling** and must be followed manually.

### Naming

| Symbol                                                | Convention       |
| ----------------------------------------------------- | ---------------- |
| Classes, interfaces, types, enums                     | `UpperCamelCase` |
| Variables, parameters, functions, methods, properties | `lowerCamelCase` |
| Global constants, enum values                         | `CONSTANT_CASE`  |
| Files                                                 | `kebab-case`     |

- Treat abbreviations as whole words: `loadHttpUrl`, not `loadHTTPURL`
- Never use `_` as a prefix, suffix, or standalone identifier — exception: prefix unused parameters required by an interface or callback signature with `_` (e.g., `_event: MouseEvent`)

### Imports and Exports

- **Named exports only** — never use default exports
- Use `node:` prefix for all Node.js built-in imports
- Use `import type` for type-only imports — required by `verbatimModuleSyntax`
- Use `export type` when re-exporting types — required by `verbatimModuleSyntax`
- Prefer relative imports (`./foo`) within the project

```ts
import { readFile } from 'node:fs/promises';
import type { Config } from './types.ts';

export function doThing(): void { ... }
export type { Config };
```

### Types

- Prefer interfaces for object shapes; use type aliases for unions, tuples, and primitives
- Use `unknown` instead of `any`; narrow with type guards before use
- Omit type annotations for trivially inferred types

### Classes

- Do not use private fields (`#ident`); use TypeScript `private` keyword instead
- Prefer parameter properties to reduce boilerplate
- Mark properties never reassigned outside the constructor as `readonly`

---

## Documentation (TSDoc + TypeDoc)

API documentation is generated from source comments using [TypeDoc](https://typedoc.org) + [TSDoc](https://tsdoc.org). Output goes to `docs/` (not committed). Run `npm run docs` to generate.

### Rules

- Document every exported symbol; do not document unexported symbols
- Use `/** ... */` blocks — single-line `//` comments do not appear in generated docs
- **Summary line first** — one sentence only; use `@remarks` for extended discussion
- **Do not repeat the type** — TypeDoc reads types from declarations. Never write `@param {string} name`
- **Always include `@example`** (fenced ` ```ts ``` ` block) for public functions
- **Document all thrown errors** with `@throws {ErrorType}`
- **Use `{@link Symbol}`** for cross-references
- Document each property of exported interfaces
- Use `@deprecated` with a migration note before removing symbols
- Use `@internal` for symbols exported for technical reasons but not part of the public API

---

## Node.js Best Practices

### Prefer Built-ins Over Dependencies

Always check for a Node.js built-in before reaching for an external package. This project targets Node >=24, which ships with:

| Need                   | Built-in                              |
| ---------------------- | ------------------------------------- |
| Testing                | `node:test`, `node:assert/strict`     |
| File I/O               | `node:fs/promises`                    |
| Path manipulation      | `node:path`                           |
| URL parsing            | `node:url`, `URL` global              |
| Crypto                 | `node:crypto`                         |
| Streams                | `node:stream`, `node:stream/promises` |
| HTTP client            | `fetch` (global)                      |
| CLI argument parsing   | `node:util` — `parseArgs`             |
| Environment variables  | `process.env`                         |
| Events                 | `node:events`                         |
| Timers (promise-based) | `node:timers/promises`                |

**Adding a dependency requires explicit justification.** If a built-in covers the use case, use it.

### Async and Error Patterns

- Prefer `async`/`await` over raw `.then()`/`.catch()` chains
- Use `node:fs/promises` and `node:stream/promises` over callback-based APIs
- Always throw `Error` instances, not strings or plain objects
- Use `cause` to chain errors: `throw new Error('msg', { cause: err })`

### ESM and Module Extensions

- All files use ESM (`import`/`export`); `"type": "module"` is set in `package.json`
- **`src/` relative imports must use `.js` extensions**, even inside `.ts` files — `tsc` does not rewrite extensions, and `NodeNext` resolution requires the output file extension:

```ts
// src/index.ts importing src/helper.ts — use .js, not .ts
import { helper } from './helper.js';
```

- **`tests/` imports from `src/` use `.ts` extensions** — tests run via `tsx`, which strips the extension at runtime, and `allowImportingTsExtensions` is enabled in `tsconfig.json`:

```ts
// tests/index.test.ts importing src/index.ts — use .ts
import { hello } from '../src/index.ts';
```

---

## Testing

Tests use Node.js built-in `node:test` and `node:assert/strict`. No external test framework.

### TDD: Red → Green → Refactor

1. **Red** — write a test for the next piece of behaviour. Run it. It must fail.
2. **Green** — write the minimum code to make the test pass. No more.
3. **Refactor** — clean up without changing behaviour. Tests must stay green.

Never write implementation code without a failing test driving it.

### Writing Tests First

Before touching `src/`, write the test file:

```ts
// tests/greeter.test.ts — written BEFORE src/greeter.ts exists
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { greet } from '../src/greeter.ts';

describe('greet', () => {
  it('returns a personalised greeting', () => {
    assert.equal(greet('Alice'), 'Hello, Alice!');
  });

  it('throws when name is empty', () => {
    assert.throws(() => greet(''), /Name must not be empty/);
  });
});
```

Run `npm test` — tests fail because `src/greeter.ts` does not exist yet. Then implement just enough to pass them.

### Test File Conventions

- Test files live in `tests/` and match `**/*.test.ts`
- Import source files using the `.ts` extension — `tsx` strips it at runtime
- One `describe` block per exported function or class
- Test names describe behaviour, not implementation: `"returns empty array when input is empty"`, not `"calls filter()"`
- Use `assert.deepEqual` for objects, `assert.equal` for primitives
- Use `assert.throws` / `assert.rejects` for error cases

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { myFunction } from '../src/index.ts';

describe('myFunction', () => {
  it('returns expected output for valid input', () => {
    assert.equal(myFunction('input'), 'expected');
  });
});
```

### Mocking

Tests must not perform real network calls or side effects. See existing tests in `tests/client/` for patterns used in this project.

- **Prefer dependency injection** — design functions to accept dependencies as parameters (e.g., the `Client` constructor accepts a custom `fetch`). This is the most testable pattern.
- **Fallback to `node:test` mocks** — use `mock.method()` or `mock.fn()` when DI is not practical
- **Always restore mocks** — use `afterEach(() => mock.restoreAll())` to prevent state leaking between tests
- **Mock at the boundary** — mock the HTTP client, file system, or external SDK; never mock internal library functions
- **Test behaviour, not implementation** — assert on outputs and observable effects, not on internal call counts
- **Keep mocks minimal** — implement only the methods the code under test actually calls

### Testing Public API

Libraries are consumed by others. Tests must verify the **public API contract**, not internals.

- Test every exported function and class
- Test error paths as thoroughly as success paths
- Test with realistic inputs, not just happy-path values
- If the library accepts callbacks or returns streams, test those contracts explicitly

---

## Git Practices

### Branch Strategy

**Never commit directly to `main` (or `master`).** All changes go through a branch and are merged via pull request.

```sh
git checkout main
git pull
git checkout -b feat/my-feature   # use the appropriate prefix
```

| Prefix      | Use                                         | Commit type |
| ----------- | ------------------------------------------- | ----------- |
| `feat/`     | New feature or capability                   | `feat:`     |
| `fix/`      | Bug fix                                     | `fix:`      |
| `chore/`    | Dependency updates, tooling, config         | `chore:`    |
| `docs/`     | Documentation only                          | `docs:`     |
| `refactor/` | Code restructuring without behaviour change | `refactor:` |
| `release/`  | Version bump and release preparation        | `chore:`    |

Branch prefix and commit type should always match.

### Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org). Every commit message must follow the format:

```text
<type>(<optional scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE: ... or Closes #123]
```

**Types:**

| Type       | Use                                                       |
| ---------- | --------------------------------------------------------- |
| `feat`     | A new feature (triggers minor version bump)               |
| `fix`      | A bug fix (triggers patch bump)                           |
| `chore`    | Tooling, dependencies, config — no production code change |
| `docs`     | Documentation only                                        |
| `refactor` | Code restructuring without behaviour change               |
| `test`     | Adding or updating tests                                  |
| `build`    | Build system or CI changes                                |

**Examples:**

```text
feat(parser): add support for nested expressions
fix: handle empty string input in parseRange
chore: bump oxlint to 1.52.0
docs: document @throws tag in AGENTS.md
test: add edge case tests for fetchUser error paths
refactor: extract validation logic into separate function
feat!: rename fetchUser to getUser
```

The `!` suffix (e.g. `feat!:`) or a `BREAKING CHANGE:` footer marks a breaking change and triggers a major version bump.

**Rules:**

- Description is lowercase and does not end with a period
- One logical change per commit
- Do not mix formatting changes with logic changes
- Reference issue numbers in the footer: `Closes #42`

### Pull Requests

- Keep PRs small and focused — one feature or fix per PR
- All checks must pass before merging: `npm run check`
- Fill in the pull request template (`.github/pull_request_template.md`): select the type of change and confirm all checklist items
- After creating the PR, stop. Do not merge it. Inform the user and wait for them to review and merge.

### Tags and Releases

- Every published npm version must have a corresponding git tag
- Tags are created automatically by `npm version` — always push them: `git push --tags`
- Do not delete or move published tags

---

## GitHub Actions

Two workflows are defined in `.github/workflows/`.

### CI (`ci.yml`)

Runs on every pull request targeting `main` and on every push to `main`.

| Step                    | Command                |
| ----------------------- | ---------------------- |
| Verify signatures       | `npm audit signatures` |
| Audit prod dependencies | `npm audit --omit=dev` |
| Format check            | `npm run format:check` |
| Type-check              | `npm run typecheck`    |
| Lint                    | `npm run lint`         |
| Test                    | `npm test`             |
| Build                   | `npm run build`        |

All steps must pass for the PR to be mergeable. Configure `main` as a protected branch in GitHub (Settings → Branches) and require this workflow as a status check.

### Publish (`publish.yml`)

Runs automatically when a version tag matching `v*.*.*` is pushed. **This is the only way to publish — do not run `npm publish` manually.**

The workflow runs `npm publish --provenance`, which:

- triggers `prepublishOnly` automatically (typecheck → lint → clean → build)
- attaches a [SLSA provenance attestation](https://docs.npmjs.com/generating-provenance-statements) to the release

**Required setup (one-time, in GitHub repository settings):**

1. Go to **Settings → Secrets and variables → Actions**
2. Add a secret named `NPM_TOKEN` with a publish-scoped npm access token
3. Go to **Settings → Branches** → add a branch protection rule for `main`:
   - Enable "Require status checks to pass" and select the `CI` workflow
   - Enable "Require a pull request before merging"

---

## npm Publishing

### Automated Pre-publish Gate

The `prepublishOnly` script runs automatically on `npm publish` and enforces:

1. `npm run check` — format, typecheck, lint, and test
2. `npm run clean` — removes stale `dist/` and `docs/`
3. `npm run build` — fresh compilation

Never bypass it with `npm publish --ignore-scripts`.

### Version Bumping

Follow [Semantic Versioning](https://semver.org). Conventional commit types map directly to version bumps:

| Commit type                                     | Bump                      |
| ----------------------------------------------- | ------------------------- |
| `feat!:` or `BREAKING CHANGE:` footer           | Major (`1.0.0` → `2.0.0`) |
| `feat:`                                         | Minor (`1.0.0` → `1.1.0`) |
| `fix:`, `chore:`, `refactor:`, `docs:`, `test:` | Patch (`1.0.0` → `1.0.1`) |

Use `npm version` to update `package.json`, commit, and tag atomically:

```sh
npm version patch   # or minor / major
```

### Verifying Package Contents

Only files listed in `"files"` in `package.json` are published:

```json
"files": ["dist", "src", "README.md", "CHANGELOG.md", "LICENSE"]
```

`src/` is included so that declaration maps (`.d.ts.map`) resolve to the original TypeScript source, enabling "Go to Definition" in consumers' IDEs.

Verify before publishing:

```sh
npm pack --dry-run
```

Check that:

- `dist/` contains `.js`, `.d.ts`, `.d.ts.map`, and `.js.map` files
- `src/` contains only `.ts` source files (no test files or config files)
- `README.md` and `CHANGELOG.md` are present

### Updating the Changelog

`CHANGELOG.md` is generated automatically by [git-cliff](https://git-cliff.org) from Conventional Commits. The configuration is in `cliff.toml`.

**Do not edit `CHANGELOG.md` by hand.** Run `npm run changelog` instead — it reads the commit history since the last tag, determines the next version, and rewrites `CHANGELOG.md` in Keep a Changelog format.

```sh
npm run changelog   # regenerates CHANGELOG.md with the next version
```

Review the output before committing. If commits in `[Unreleased]` were mislabelled, fix the commit messages first (via `git rebase -i`) before running `npm run changelog`.

> **Note:** Comparison links at the bottom of `CHANGELOG.md` are not auto-generated. After running `npm run changelog`, manually add or update the links in the form:
>
> ```markdown
> [1.1.0]: https://github.com/owner/repo/compare/v1.0.0...v1.1.0
> [Unreleased]: https://github.com/owner/repo/compare/v1.1.0...HEAD
> ```

### Publish Checklist

- [ ] All tests pass (`npm test`)
- [ ] `README.md` reflects all new or changed public API since the last release
- [ ] `npm run changelog` — regenerates `CHANGELOG.md`; review the output
- [ ] `git add README.md CHANGELOG.md && git commit -m "chore: release vX.Y.Z"` (use the version printed by git-cliff)
- [ ] `npm version patch` (or `minor` / `major` — must match the version git-cliff determined)
- [ ] `npm pack --dry-run` — verify published contents
- [ ] No uncommitted changes (`git status` is clean)
- [ ] `git push --follow-tags` — the `publish` workflow triggers automatically on the version tag

---

## Development Cycle

Quick-reference checklist. Full rules for each step are in the sections above.

### Feature or Fix

- [ ] **Clarify** — resolve all ambiguities before writing any file (→ [Core Principles](#core-principles--agent-directives))
- [ ] **Branch** — `git checkout main && git pull && git checkout -b feat/my-feature`
- [ ] **Red** — write failing tests covering success path, error cases, and edge values; run `npm test`, they must fail
- [ ] **Green** — write minimum `src/` code to pass tests; use `npm run dev` for watch mode
- [ ] **Refactor** — clean up with tests staying green; run `npm test`
- [ ] **Validate** — `npm run format && npm run check`; fix any remaining issues with `npm run lint:fix`
- [ ] **Commit** — stage `package-lock.json` too if any dependency changed (`npm install` must be re-run after editing `package.json`); then `git commit -m "feat: description"` (→ [Commits](#commits))
- [ ] Repeat **Red → Green → Refactor → Validate → Commit** for each requirement

### Pull Request

- [ ] `git push -u origin feat/my-feature`
- [ ] Update `README.md` if the PR adds, removes, or changes any public API, option, or usage pattern
- [ ] Open PR against `main` and fill in the pull request template:
  - Select the correct type of change
  - Confirm tests are added or updated
  - Confirm `README.md` is up to date
  - Confirm `CHANGELOG.md` is updated under `[Unreleased]`
  - Confirm `npm run check` passes
- [ ] **Stop. Inform the user. Wait for them to review and merge.**

### Release (on `main` after merge)

- [ ] `git checkout main && git pull`
- [ ] Review `README.md` — ensure it reflects all new or changed public API introduced since the last release
- [ ] `npm run changelog` — regenerates `CHANGELOG.md` from commits; review the output (→ [Updating the Changelog](#updating-the-changelog))
- [ ] `git add README.md CHANGELOG.md && git commit -m "chore: release vX.Y.Z"` (use the version printed by git-cliff; also stage `package-lock.json` if any dependency was updated since the last release)
- [ ] `npm version patch` (or `minor` / `major` — must match the version git-cliff determined)
- [ ] `npm pack --dry-run` — verify published contents (→ [Verifying Package Contents](#verifying-package-contents))
- [ ] `git push --follow-tags` — the `publish` workflow triggers automatically; do not run `npm publish` manually

---

## Gotchas

- **BCCH API rate limit** — maximum 5 simultaneous requests per second per account. Do not add parallel fetching or bulk request features without explicit throttling.
- **`fillForward` throws on leading gaps** — if the first observation has no valid value, `fillForward` throws. Ensure the start date falls on a trading day when writing tests or examples.
- **`cliff.toml` is formatted by `oxfmt`** — this is non-obvious since it's a TOML file, but `oxfmt` includes it in its formatting scope. If you edit `cliff.toml`, run `npm run format`.
- **`src/` uses `.js` extensions, `tests/` uses `.ts` extensions** — see [ESM and Module Extensions](#esm-and-module-extensions). Getting this wrong causes runtime errors that the type-checker won't catch.
- **Zero production dependencies** — this library has no `dependencies`, only `devDependencies`. Adding a production dependency is a significant decision that affects all consumers.
