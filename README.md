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
| `npm run check:env`     | `.env.example` matches `env.schema.ts`     |

## Configuration

- [playwright.config.ts](playwright.config.ts): projects, reporters, retries, workers, artifacts.
- [config/env.schema.ts](config/env.schema.ts): single source of truth for environment variables
  (names, types, defaults, required/optional).
- [config/env.ts](config/env.ts): loads and validates the environment, and exports a typed,
  frozen `env` (plus `redactedEnv()` for logs). The only place `process.env` is read.
- [.env.example](.env.example): documented variables. Real `.env*` files are gitignored.

Precedence (highest first): real environment variables (CI secrets), `.env.<TEST_ENV>`, `.env`.
Empty values count as unset. Missing or invalid values fail at startup with a list of variable
names and reasons (values are never printed). Import `env` from `config/env` in the Playwright
config; tests receive it through a fixture once fixtures exist.

| Variable       | Description                                           |
| -------------- | ----------------------------------------------------- |
| `TEST_ENV`     | `dev` (default), `staging` or `prod-smoke`            |
| `BASE_URL`     | Application under test (required)                     |
| `API_BASE_URL` | Optional; defaults to `BASE_URL`                      |
| `LOG_LEVEL`    | `debug`, `info` (default), `warn` or `error`          |
| `WORKERS`      | Optional worker count override                        |
| `CI`           | Set by CI providers; enables retries and `forbidOnly` |

Adding a variable: add it to `env.schema.ts`, expose it in `env.ts`, document it in
`.env.example`, then run `npm run check:env`.

## Defaults

- Fully parallel; `50%` of cores locally, 2 workers in CI
- Retries: 0 locally, 1 in CI
- Trace on first retry, screenshot and video retained on failure
- HTML report in `playwright-report/`

## Status

Foundation only. Page objects, fixtures, API clients and auth are added per project as needed.
