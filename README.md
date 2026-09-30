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

| Script                    | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `npm test`                | Run all tests on Chromium, Firefox, WebKit |
| `npm run test:chromium`   | Run on Chromium only                       |
| `npm run report`          | Open the last HTML report                  |
| `npm run lint`            | ESLint (type-aware)                        |
| `npm run typecheck`       | `tsc --noEmit`, strict mode                |
| `npm run format`          | Prettier write (`format:check` to verify)  |
| `npm run check:env`       | `.env.example` matches `env.schema.ts`     |
| `npm run auth:clear`      | Delete saved sessions (`.auth/`)           |
| `npm run test:smoke`      | Run tests tagged `@smoke`                  |
| `npm run test:regression` | Run tests tagged `@regression` (all tests) |
| `npm run test:e2e`        | Run tests tagged `@e2e` (UI, all browsers) |
| `npm run test:api`        | Run tests tagged `@api` (no browser)       |
| `npm run check:tags`      | Every test has valid, known tags           |

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

| Variable                             | Description                                               |
| ------------------------------------ | --------------------------------------------------------- |
| `TEST_ENV`                           | `dev` (default), `staging` or `prod-smoke`                |
| `BASE_URL`                           | Application under test (required)                         |
| `API_BASE_URL`                       | Optional; defaults to `BASE_URL`                          |
| `LOG_LEVEL`                          | `debug`, `info` (default), `warn` or `error`              |
| `WORKERS`                            | Optional worker count override                            |
| `CI`                                 | Set by CI providers; enables retries and `forbidOnly`     |
| `<ROLE>_USERNAME`, `<ROLE>_PASSWORD` | Credentials per role (required), e.g. `STANDARD_USERNAME` |
| `AUTH_MAX_AGE_MIN`                   | Reuse saved sessions younger than this (default 60)       |
| `AUTH_ROLES`                         | Optional comma-separated subset of roles to authenticate  |

Adding a variable: add it to `env.schema.ts`, expose it in `env.ts`, document it in
`.env.example`, then run `npm run check:env`.

## Authentication

Sessions are created once per run, outside the tests, and reused through Playwright's
`storageState`. Tests do not log in through the UI unless login is the feature under test.

- **Setup project:** [tests/setup/auth.setup.ts](tests/setup/auth.setup.ts) authenticates every
  role and saves `.auth/<TEST_ENV>/<role>.json`. Browser projects depend on it. It runs with
  trace, video and screenshots off.
- **Roles:** the keys of `env.users` (see [src/auth/state.ts](src/auth/state.ts)). Credentials come
  only from env. A role's login method is set in
  [src/auth/authenticate.ts](src/auth/authenticate.ts): prefer an API login when the app has one,
  otherwise log in through the UI. The demo app only has UI login.
- **Freshness:** a saved session is reused when the file is younger than `AUTH_MAX_AGE_MIN` and no
  cookie expires within 5 minutes. Keep `AUTH_MAX_AGE_MIN` below the app's real session lifetime.
  A server that invalidates sessions early, or a token in localStorage, is not detected.
- **In tests:**
  - Unauthenticated: the default. Nothing to configure.
  - One role: `test.use({ storageState: authFile('standard') })`, then navigate.
  - Several roles in one test: the `contextAs(role)` fixture returns a signed-in context.
- **Secrets:** `.auth/*.json` hold live session tokens. They are gitignored and must never be
  uploaded as CI artifacts. Credentials live in `.env` locally and in the CI secret store in CI.
- **Parallelism:** state files are read-only during tests. Apps with shared per-user server state
  may need a per-worker user pool; not included until a project needs it.

## API testing

Built on Playwright's native `APIRequestContext`; nothing wraps `request`.

- **Clients:** [src/api/clients/booking.client.ts](src/api/clients/booking.client.ts) is a thin typed
  class: one method per endpoint, returning validated models and throwing `ApiError` on failure.
- **Models:** zod schemas in [src/api/models/](src/api/models/) give both types and runtime
  validation, so a changed response shape fails with a clear message.
- **Errors:** [src/api/http.ts](src/api/http.ts) (`ensureOk`, `readJson`) throws `ApiError` with the
  call, status, URL and a truncated body. Do not put secrets in response logging.
- **Authentication:** [src/api/auth.ts](src/api/auth.ts) exchanges credentials for a token and is the
  only place that knows how the token is attached. The `apiToken` fixture logs in once per worker
  and keeps the token in memory (nothing written to disk).
- **Fixtures:** `anonymousApi` (no credentials), `apiRequest` (authenticated `APIRequestContext`),
  `bookingClient`, and `booking` (a record created through the API and removed afterwards). They
  are in the shared `test`, so a UI spec can request `booking` for API-based setup. Contexts are
  created per test and disposed, so UI tests that do not ask for them never pay for an API login.
- **Projects:** specs in `tests/api/` run once in the browserless `api` project; the browser
  projects ignore that folder.

To add an endpoint group, add a model, a client class and a fixture that constructs it.

Test data rules (factories, unique values, API-created data and cleanup, per-environment data) are
in [docs/test-data.md](docs/test-data.md).

## Tagging

Tags use Playwright's native `tag` option and `--grep`. Every test carries one **type** tag and the
**scope** tags below:

| Tag           | Meaning                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `@e2e`        | Drives the UI in a browser (runs in every browser project)                    |
| `@api`        | Calls the API only (runs once in the browserless `api` project)               |
| `@regression` | In the full regression run. Every test has it                                 |
| `@smoke`      | Critical-path subset, fast enough for every change. Also tagged `@regression` |

```ts
test.describe('inventory', { tag: ['@e2e', '@regression'] }, () => {
  test('lists the available products', { tag: '@smoke' }, async ({ inventoryPage }) => { ... });
});
```

Combine scripts with Playwright options, e.g. `npm run test:smoke -- --project=chromium`, or run
arbitrary expressions with `npx playwright test --grep "@smoke|@api"` and `--grep-invert @slow`.
Tag filters do not filter the auth setup project, so `@smoke` runs still authenticate.
`npm run check:tags` fails on an unknown tag (e.g. a typo) or a test missing its type or scope tag,
so a mistake cannot silently drop a test from a run. Project-specific tags (feature areas,
`@destructive`) can be added to `KNOWN` in `scripts/check-tags.ts`.

## Defaults

- Fully parallel; `50%` of cores locally, 2 workers in CI
- Retries: 0 locally, 1 in CI
- Trace on first retry, screenshot and video retained on failure
- HTML report in `playwright-report/`

## Status

Foundation with example page objects, components, fixtures and authentication. API clients,
logging and CI are added per project as needed.
