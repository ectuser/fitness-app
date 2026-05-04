# Workout Create Form Draft Persistence Design

Date: 2026-05-04
Status: Approved (brainstorming phase)
Scope: Persist only the `/workouts/new` form draft in localStorage, with explicit cleanup rules.

## Goals

- Preserve in-progress workout creation data if the user leaves and returns to `/workouts/new`.
- Restore only safe, validated, non-stale drafts.
- Keep edit flow (`/workouts/:id/edit`) unchanged.
- Ensure deterministic cleanup on success and cancel actions.

## Non-Goals

- No draft persistence for workout edit mode.
- No generic draft framework for other forms.
- No partial salvage of invalid drafts.

## Approved Product Decisions

- Persistence applies only to `Create Workout` (`/workouts/new`).
- Clear draft on:
  - Successful `Create Workout`
  - Successful `Save and Finish Workout`
  - `Cancel`
- Persist full form payload:
  - `name`
  - `date`
  - `exercises` (including sets, comment, order)
- Draft expiration window: 7 days.
- Validation approach: Zod schema with strict reject-on-error behavior.
- Type source of truth: infer TypeScript type from the Zod schema.

## Architecture

### New hook

Create `src/hooks/useWorkoutCreateDraft.ts` to encapsulate draft behavior for create mode only.

Responsibilities:
- `restoreDraft()` for loading and validating draft data.
- `persistDraft(payload)` for writing full draft snapshots.
- `clearDraft()` for explicit cleanup.

`WorkoutEditPage` remains the owner of form state. The hook handles storage I/O and lifecycle decisions.

### Storage key

Add a new key in `src/lib/storage.ts`:
- `WORKOUT_CREATE_DRAFT: 'fitness-app-workout-create-draft'`

## Data Model

Define a schema in the draft hook (or draft helper module):

- `name: z.string()`
- `date: z.string()`
- `exercises: z.array(...)` (schema mirrors persisted `WorkoutExercise` structure)
- `updatedAt: z.string()` (ISO timestamp)

Type definition:
- `type WorkoutCreateDraft = z.infer<typeof WorkoutCreateDraftSchema>`

## Data Flow

### Restore flow (create mode only)

1. On `/workouts/new` initialization, read localStorage value for draft key.
2. Parse JSON.
3. Validate with `safeParse` against `WorkoutCreateDraftSchema`.
4. If parse fails or validation fails:
   - remove draft key
   - return no draft
5. If validation succeeds, evaluate staleness using `updatedAt`.
6. If older than 7 days:
   - remove draft key
   - return no draft
7. If valid and fresh, hydrate `name`, `date`, and `exercises` into page state.

### Persist flow (create mode only)

On any create-form mutation (`name`, `date`, or `exercises` changes), write full snapshot with refreshed `updatedAt`.

### Cleanup flow

- On successful `Create Workout`: clear draft before navigation.
- On successful `Save and Finish Workout`: clear draft before navigation.
- On `Cancel`: clear draft, then navigate.

## Error Handling Policy

- Invalid data is never partially restored.
- Any invalid/expired draft is proactively removed.
- Storage access errors are handled safely (same behavior style as existing storage helpers): fail closed, continue app flow.

## Testing Plan

### Unit tests

Add unit coverage for draft logic (hook-level or extracted helper-level):

- restores valid, non-expired draft
- removes and rejects malformed JSON
- removes and rejects schema-invalid draft
- removes and rejects expired draft (`> 7 days`)
- persists full payload with `updatedAt`
- clears draft on explicit clear call

### E2E tests

Add create-workout draft persistence scenario:

- Open `/workouts/new`
- Fill `name`, `date`
- Add exercise and modify nested exercise data (set/comment/order)
- Navigate away without save/cancel
- Return to `/workouts/new`
- Assert full form restoration

Add cleanup assertions:

- after `Create Workout`, draft key is absent
- after `Save and Finish Workout`, draft key is absent
- after `Cancel`, draft key is absent

## Rollout Notes

- Keep implementation narrowly scoped to the approved create flow.
- Avoid refactoring unrelated storage or workout editor internals.
- If future forms need drafts, consider extracting generic utilities later (out of current scope).
