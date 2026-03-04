# Agent Guide for vs_frontend

## Scope Discipline

- Only implement exactly what the user requests; do not expand the scope on your own.
- If you believe additional changes are needed, ask the user for approval before proceeding.

## Verification

For verification use:

- npm run build
- npm run typecheck
- npm run lint
- npm run test:e2e

## TDD (Red-Green-Refactor)

- Always use TDD with the Red-Green-Refactor cycle.
- Red: write or update a unit test first, and make sure it fails for the intended reason.
- Green: write the minimal production code needed to make that test pass.
- Refactor: improve design/readability only after tests are green, and keep tests green during refactoring.
- Work in small iterations: one behavior at a time, one failing test at a time.
- For each new feature, start with failing tests before implementation.
- For existing features, apply TDD when the user explicitly requests work on that feature.
- Do not skip the Red step by writing implementation first.
- Keep test failures informative: assert behavior, not internal implementation details.
- When asked to use TDD, follow this strict protocol.
- New feature protocol:
  1. Write one test.
  2. Verify the test fails.
  3. Write code until that test is green.
  4. Optional: if the user asked for clean code, improve organization without changing tests.
  5. Proceed to the next test file.
- Existing feature protocol (when tests must change):
  1. Adjust one test.
  2. Run this test and ensure it fails.
  3. Adjust functionality for this one test.
  4. Run the test and ensure it succeeds.
- Refactor protocol (clean up/splitting/improving existing solution):
  1. Write tests or confirm tests already cover functionality.
  2. Run tests and ensure they succeed.
  3. Refactor and improve code.
  4. Run tests and ensure they still succeed.
- Scope rule for tests: change only one test file at a time, finish its red-green cycle, then proceed to the next test file.
- If tests are changed after functionality was written, always call this out with EXTRA ATTENTION IN CAPS, and include:
  - how it was before,
  - how it is now,
  - why the test was changed.

## Pull Requests

- When asked to create a PR, use Github MCP and create the PR in the corresponding project
- Use this PR description format with Markdown headings:

```md
## Problem

<short problem>

## Approach

<description>

## Changes

- <core change 1>
- <core change 2>
```
