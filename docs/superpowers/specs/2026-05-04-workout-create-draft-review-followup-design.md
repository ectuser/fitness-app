# Workout Create Draft Review Follow-up Design

Date: 2026-05-04
Status: Approved in-session (design phase)
Scope: Address two review findings for workout-create draft persistence with minimal-risk changes.

## Review Findings in Scope

1. `resetAllData()` does not clear `WORKOUT_CREATE_DRAFT`.
2. Spec wording drift vs implementation field names (`workoutExercises`/`savedAt` in spec vs `exercises`/`updatedAt` in runtime).

## Goals

- Ensure full data reset also removes create-workout draft state.
- Align spec terminology with the current implementation to eliminate ambiguity.
- Keep runtime payload shape unchanged to avoid migration/compatibility scope.

## Non-Goals

- No rename of persisted draft payload fields in production code.
- No draft storage migration or backward-compat adapters.
- No refactor of reset architecture beyond required key cleanup.

## Product Decisions

- Adopt Option 1 (minimal risk):
  - Keep runtime payload fields as `exercises` and `updatedAt`.
  - Update spec language to match runtime.
- Fix reset behavior by clearing `STORAGE_KEYS.WORKOUT_CREATE_DRAFT` in `resetAllData()`.
- Add regression assertion that reset clears the draft key.

## Design

### 1) Reset flow correctness

Update `resetAllData()` in `src/hooks/usePersistentFitnessData.ts`:
- Add removal of `STORAGE_KEYS.WORKOUT_CREATE_DRAFT` alongside existing key removals.

Expected behavior:
- After dashboard reset action, all app datasets and workout-create draft storage are cleared.

### 2) Spec and implementation consistency

Update `docs/superpowers/specs/2026-05-04-workout-create-draft-persistence-design.md` to reflect current implementation names:
- `workoutExercises` -> `exercises`
- `savedAt` -> `updatedAt`
- corresponding restore/persist flow wording updates.

Expected behavior:
- Design spec is semantically aligned with deployed code and tests.

### 3) Regression coverage

Update reset e2e coverage in `tests/e2e/dashboard-reset-data.spec.ts`:
- Add assertion that `fitness-app-workout-create-draft` key is absent after reset.

Expected behavior:
- Future regressions in reset-key cleanup are caught in CI.

## Verification Plan

Required full gate after implementation:
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test:e2e`

Additionally, run code review after implementation update and address any Important/Critical findings before merge.

## Risks and Mitigations

- Risk: touching reset flow introduces unintended side effects.
  - Mitigation: scope to single key removal line + existing reset e2e path.
- Risk: doc update diverges from code later.
  - Mitigation: keep terminology synchronized with tested runtime schema.

## Acceptance Criteria

1. Reset flow removes `WORKOUT_CREATE_DRAFT` key.
2. Reset e2e test asserts draft key is cleared and passes.
3. Follow-up spec text matches runtime draft field names (`exercises`, `updatedAt`).
4. Full verification gate passes.
