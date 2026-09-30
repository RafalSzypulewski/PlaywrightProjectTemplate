# Playwright Project Template

Reusable Playwright + TypeScript test automation framework template, intended to be copied into
independent automation projects. Engineering rules live in [CLAUDE.md](CLAUDE.md).

## Requirements

- Node.js 20+
- npm

## Getting started

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
npm test
```

## Scripts

| Script                  | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `npm test`              | Run all tests on Chromium, Firefox, WebKit |
| `npm run test:chromium` | Run on Chromium only                       |
| `npm run report`        | Open the last HTML report                  |
| `npm run lint`          | ESLint (type-aware)                        |
| `npm run typecheck`     | `tsc --noEmit`, strict mode                |
| `npm run format`        | Prettier write (`format:check` to verify)  |

## Configuration

- [playwright.config.ts](playwright.config.ts): projects, reporters, retries, workers, artifacts.
- [config/env.ts](config/env.ts): loads `.env.<TEST_ENV>` then `.env`, validates with zod and
  exports a typed `env`. This is the only place `process.env` is read.
- [.env.example](.env.example): documented variables. Real `.env*` files are gitignored.

| Variable   | Description                                           |
| ---------- | ----------------------------------------------------- |
| `TEST_ENV` | `dev` (default), `staging` or `prod-smoke`            |
| `BASE_URL` | Application under test                                |
| `WORKERS`  | Optional worker count override                        |
| `CI`       | Set by CI providers; enables retries and `forbidOnly` |

## Defaults

- Fully parallel; `50%` of cores locally, 2 workers in CI
- Retries: 0 locally, 1 in CI
- Trace on first retry, screenshot and video retained on failure
- HTML report in `playwright-report/`

## Status

Foundation only. Page objects, fixtures, API clients and auth are added per project as needed.
