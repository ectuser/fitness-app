# Action Button Ordering and Variant Consistency Design

Date: 2026-05-04
Status: Approved (design)

## Problem

Current action rows are inconsistent across pages and dialogs:

- `Cancel` does not always use the same visual treatment.
- Completion actions (`Save`, `Submit`, `Create`, `Finish`, `Continue`) do not always use a consistent variant.
- Desktop and mobile ordering are not aligned to the requested pattern.

## Goal

Apply a consistent cross-app rule for paired action buttons:

- `Cancel`: always `ghost`.
- Completion action (`Save`, `Submit`, `Create`, `Finish`, `Continue`): always `outline`.
- Ordering rule:
  - Desktop: `Cancel` then completion action.
  - Mobile stacked: completion action above `Cancel`.

## Scope

In scope:

- Existing page/form action rows.
- Existing dialog/footer action rows where cancel-style and completion-style actions are paired.

Out of scope:

- New shared component refactor.
- Behavior changes to submit/cancel handlers.
- Unpaired standalone actions.

## Implementation Design

1. Update paired action row markup to enforce responsive ordering with existing Tailwind layout utilities.
2. Set `Cancel` buttons to `variant="ghost"` in scoped rows/footers.
3. Set paired completion buttons to `variant="outline"` in scoped rows/footers.
4. Update shared alert-dialog cancel primitive default to `ghost` so dialog cancel buttons are consistent by default.

## Target Files

- `src/components/exercise/ExerciseForm.tsx`
- `src/pages/WorkoutEditPage.tsx`
- `src/pages/WorkoutSessionPage.tsx`
- `src/components/ui/alert-dialog.tsx`

Additional files may be touched only if discovered as existing paired cancel/completion rows requiring the same rule.

## Risks and Mitigation

- Risk: Styling-only changes can accidentally alter spacing/alignment.
  - Mitigation: Keep existing container structures and only adjust variant/order classes.
- Risk: Some action labels may be ambiguous in intent.
  - Mitigation: Apply completion variant changes only where actions are clearly submit/save/finish/continue semantics.

## Verification Plan

Run required project checks:

1. `npm run build`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test:e2e`

Then run a targeted grep check for potential misses in paired action contexts.

## Acceptance Criteria

- In scoped paired actions, `Cancel` renders as `ghost`.
- In scoped paired actions, completion action renders as `outline`.
- In scoped paired actions, desktop order is `Cancel` then completion action.
- In scoped paired actions, mobile stacked order shows completion action above `Cancel`.
- All required verification commands pass.
