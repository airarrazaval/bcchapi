# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-03-10

### Added

- `bcchapi/client` — typed HTTP client (`Client`, `ApiError`, `HttpError`) for the Banco Central de Chile REST API
- `bcchapi/series` — curated `SERIES` constants covering exchange rates, prices, interest rates, money, national accounts, external sector, employment, public finances, and capital markets
- `bcchapi/utils` — observation transform functions (`parseValue`, `filterValid`, `toNumbers`, `toMap`, `toArrays`, `parseObservationDate`, `formatQueryDate`) and statistics functions (`mean`, `stdDev`, `min`, `max`, `periodVariation`, `annualVariation`, `rollingMean`)
- ESM-only output targeting Node.js >= 24
- Full TypeScript declarations and source maps
- npm provenance via GitHub Actions (SLSA)

---

[2.0.0]: https://github.com/airarrazaval/bcchapi/releases/tag/v2.0.0
