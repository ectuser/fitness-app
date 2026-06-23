# Agent Guide for Fitness Tracker

Keep this file short and concise.

## Scope Discipline

- Only implement exactly what the user requests; do not expand the scope on your own.
- If you believe additional changes are needed, ask the user for approval before proceeding.

## Verification

For verification use:

- pnpm build
- pnpm typecheck
- pnpm lint
- pnpm test:e2e

## Commits

- Use Conventional Commits for all commit messages.

## Dependencies

- All dependency versions in package manifests must be pinned exactly. Version ranges and tags such as `^`, `~`, `*`, and `latest` are prohibited.

## TDD

- Prefer Red-Green-Refactor for new behavior.
- For existing features, adjust tests first when the requested change requires behavior changes.
- Keep test failures informative: assert behavior, not internal implementation details.
- If tests are changed after functionality was written, always call this out with EXTRA ATTENTION IN CAPS, and include how it was before, how it is now, and why the test changed.
