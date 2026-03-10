# Contributing

## Development setup

```sh
npm install
npm run dev   # run tests in watch mode
```

## Workflow

All changes go through a branch and are merged via pull request — never commit directly to `main`.

```sh
git checkout main && git pull
git checkout -b feat/my-feature
```

| Prefix      | Use                                         |
| ----------- | ------------------------------------------- |
| `feat/`     | New feature or capability                   |
| `fix/`      | Bug fix                                     |
| `chore/`    | Dependency updates, tooling, config         |
| `docs/`     | Documentation only                          |
| `refactor/` | Code restructuring without behaviour change |

This project follows strict **TDD** (Red → Green → Refactor). Write failing tests before any implementation. See [AGENTS.md](AGENTS.md) for the full agent and development guidelines.

## Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org):

```text
<type>(<optional scope>): <short description>
```

| Type       | Use                                                       | Version bump |
| ---------- | --------------------------------------------------------- | ------------ |
| `feat`     | New feature                                               | minor        |
| `fix`      | Bug fix                                                   | patch        |
| `chore`    | Tooling, dependencies, config — no production code change | patch        |
| `docs`     | Documentation only                                        | patch        |
| `refactor` | Code restructuring without behaviour change               | patch        |
| `feat!`    | Breaking change                                           | major        |

## Commands

```sh
npm test               # run tests
npm run dev            # run tests in watch mode
npm run check          # typecheck + lint + test
npm run typecheck      # type-check without emitting
npm run lint           # lint src/ and tests/
npm run format         # format all files
npm run build          # compile src/ → dist/
```

Always run `npm run check` before opening a PR.

## Release process

Releases are published to npm automatically when a version tag is pushed.

```sh
# 1. Regenerate CHANGELOG.md (auto-determines next version)
npm run changelog

# 2. Commit and bump version
git add CHANGELOG.md && git commit -m "chore: release vX.Y.Z"
npm version patch  # or minor / major

# 3. Push — the publish workflow triggers automatically on the version tag
git push --follow-tags
```
