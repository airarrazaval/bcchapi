# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-03-11

### Added

- **BREAKING:** Make Cache interface async-compatible and add `clear()` method

### Changed

- Remove redundant checks in dates and transform

### Fixed

- Replace spread with loop in min/max to avoid stack overflow on large datasets
- Standardize JSDoc import paths to bcchapi


---
## [2.2.3] - 2026-03-11


### Changed

- Release v2.2.3
- Upgrade typescript to 5.9.3 and document series catalog


---
## [2.2.2] - 2026-03-10


### Changed

- Release v2.2.2
- Fix formatting
- Move ApiError and HttpError to errors.ts


---
## [2.2.1] - 2026-03-10


### Changed

- Release v2.2.1
- Add npm keywords for discoverability


---
## [2.2.0] - 2026-03-10


### Added

- Add fillForward utility


### Changed

- Release v2.2.0
- Always run format before check in dev workflow
- Fix formatting
- Add check script and move release docs to CONTRIBUTING.md
- Update README for v2.1.0 caching and fix AGENTS.md checklists


---
## [2.1.0] - 2026-03-10


### Added

- Add pluggable caching layer to Client (bcchapi/cache)


### Changed

- Bump version to 2.1.0
- Release v2.1.0
- Fix formatting


---
## [2.0.1] - 2026-03-10


### Changed

- Release v2.0.1
- Rewrite CHANGELOG for v2.0.0 initial release
- Write README for bcchapi v2


---
## [2.0.0] - 2026-03-10


### Changed

- Rename package to bcchapi and bump to v2.0.0


### Fixed

- Update repository URLs to bcchapi after GitHub rename


---
## [0.1.0] - 2026-03-10


### Added

- Wire up root src/index.ts re-exports and replace template test
- Add date, transform, and stats utility functions
- Add SERIES constants with curated well-known series IDs
- Add Client, ApiError, and HttpError with full test coverage


### Changed

- Release v0.1.0


### Fixed

- Set publishConfig access to public for npm provenance


---