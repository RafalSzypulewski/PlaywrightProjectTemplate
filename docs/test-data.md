# Test data

## Principles

1. **Every test owns the data it needs.** Create it, use it, remove it. No test depends on
   pre-existing records or on another test.
2. **Data is plain typed values and plain functions.** No data manager, repository or builder
   classes.
3. **Secrets never live in `src/data`.** They come only from the typed `env` (`config/env.ts`).

## Where each kind of data lives

| Need                                   | Mechanism                                                      | Location                          |
| -------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| Static data (reference values, inputs) | Typed `as const` constants, imported directly                  | `src/data/<topic>.ts`             |
| Dynamic data                           | Factory `buildX(overrides)` returning the API model type       | `src/data/<entity>.factory.ts`    |
| Unique values                          | `unique('label')` → `auto-label-1a2b3c4d`                      | `src/data/unique.ts`              |
| Environment-specific data              | `Record<TestEnv, ...>` map chosen by `env.testEnv` (see below) | `src/data/seeded.ts` (project)    |
| Secrets                                | Env variables declared in `config/env.schema.ts`               | never in `src/data`               |
| API-created data with cleanup          | Fixture: create via client, `use()`, delete in teardown        | `src/fixtures/*.fixture.ts`       |
| Data-driven tests                      | Array plus `for...of` generating tests; inline if small        | the spec, or `src/data` if shared |

## Factories and unique data

- A factory returns a valid, complete model and accepts `Partial<Model>` overrides, so a test states
  only what matters to it.
- Use `unique()` for anything that must not collide. The `auto-` prefix marks everything the
  automation creates, so leftovers in a shared environment are identifiable (and can be swept).
- No faker dependency by default. Add `@faker-js/faker` when a project needs realistic data.

## API-created data and cleanup

Two fixture shapes, copied per entity rather than abstracted:

- **Several or customised records:** `createBooking(overrides)` returns a function, tracks every
  record it creates and deletes them all in teardown.
- **One record:** `booking` is built on `createBooking()`.

Rules:

- Cleanup lives **only in fixture teardown**, never in scattered `afterEach` blocks.
- Every delete is attempted even if one fails. A record the test already deleted is tolerated
  (404/405); **any other cleanup failure fails the test**, so leaks surface. On a noisy shared
  environment this can be relaxed to warn-and-continue.
- Data created through the UI is cleaned up through the API: the fixture finds it by its unique
  name and deletes it.
- A test that deletes or mutates its data must use its own record, never a shared one.

## Environment-specific data

Prefer tests that create their own data, so there is little to vary. When a project has seeded,
non-secret data that differs per `TEST_ENV`, add a typed map and select by `env.testEnv`:

```ts
import { env } from '../../config/env';

const seeded = {
  dev: { adminName: 'Dev Admin' },
  staging: { adminName: 'Staging Admin' },
  'prod-smoke': { adminName: 'Smoke Admin' },
} satisfies Record<typeof env.testEnv, { adminName: string }>;

export const seededData = seeded[env.testEnv];
```

Values that are secrets or URLs belong in env variables instead.

## Parallelism and read-only environments

- Per-test ownership plus unique values makes parallel runs safe. Shared mutable records are not
  allowed. If an app needs a distinct user per worker, use a per-worker user pool.
- Tests that create or change data get the `@destructive` tag. Read-only runs (`prod-smoke`)
  use `npm run test:readonly` (`--grep-invert @destructive`).
