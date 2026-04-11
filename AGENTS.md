# Agent Guide for Fitness Tracker

## Scope Discipline

- Only implement exactly what the user requests; do not expand the scope on your own.
- If you believe additional changes are needed, ask the user for approval before proceeding.

## Verification

For verification use:

- npm run build
- npm run typecheck
- npm run lint
- npm run test:e2e

## TDD

- Prefer Red-Green-Refactor for new behavior.
- For existing features, adjust tests first when the requested change requires behavior changes.
- Keep test failures informative: assert behavior, not internal implementation details.
- If tests are changed after functionality was written, always call this out with EXTRA ATTENTION IN CAPS, and include how it was before, how it is now, and why the test changed.
