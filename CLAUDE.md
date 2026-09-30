# Playwright Automation Framework

## Purpose

This repository is a reusable Playwright + TypeScript test automation
framework template.

It is intended to be copied into multiple independent projects.

## Technology

- TypeScript
- Playwright
- Node.js
- npm
- ESLint
- Prettier

## Architecture

Use:

- Page Objects for page-level behavior
- Component Objects for reusable UI components
- Fixtures for dependency injection and test setup
- API clients for reusable API operations
- Utilities only for genuinely generic functionality

## Rules

1. Prefer Playwright native APIs over custom wrappers.
2. Do not create generic wrapper methods such as:
   - click()
   - fill()
   - wait()
   - expect()
3. Never use arbitrary timeouts such as:
   page.waitForTimeout(...)
4. Prefer locator-based synchronization.
5. Avoid XPath unless there is a specific reason.
6. Prefer accessible locators.
7. Tests should describe business behavior, not implementation details.
8. Page Objects should expose meaningful user actions.
9. Do not put assertions everywhere in Page Objects.
10. Avoid static global state.
11. Avoid test-order dependencies.
12. Tests must be independently runnable.
13. Test data must not be hardcoded inside tests when reusable.
14. Secrets must never be committed.
15. Environment-specific configuration belongs outside test code.
16. Do not introduce an abstraction unless it removes meaningful duplication.
17. Keep fixtures small and composable.
18. Prefer composition over inheritance.
19. TypeScript strict mode must remain enabled.
20. Every new framework abstraction must have a clear reason to exist.

## Before changing architecture

Explain:

- why the change is necessary
- what problem it solves
- alternatives considered

Do not introduce architectural changes silently.