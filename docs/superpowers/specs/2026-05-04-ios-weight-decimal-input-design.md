# iOS Weight Decimal Input Design

Date: 2026-05-04
Status: Approved for planning

## Problem Statement
On iOS, entering decimal weight using the locale separator (comma) in the weight input currently fails. Example: typing `6`, then `,`, then `5` results in `65` instead of `6.5`.

## Goal
Support decimal weight entry on iOS reliably while preserving current app behavior for validation and precision.

## In Scope
- Weight field in workout set entry should accept both comma and dot decimal separators.
- Both `6,5` and `6.5` should be normalized and stored as numeric `6.5`.
- Existing normalization behavior should remain:
  - invalid values normalize to `0`
  - negative values normalize to `0`
  - numeric precision is truncated to 2 decimals

## Out of Scope
- Changing reps input behavior
- Adding locale-specific display formatting
- Broad input refactors outside the weight field in set entry

## Approach Options Considered

### Option 1: Keep `type="number"` and replace comma with dot before parsing
- Pros: Small code change
- Cons: iOS numeric input quirks can still interfere with typing separators in controlled inputs

### Option 2 (Recommended): Use `type="text"` + `inputMode="decimal"` for weight and parse/sanitize explicitly
- Pros: Most reliable for iOS typing behavior, predictable parsing, no UA detection
- Cons: Slightly more parsing responsibility in component code

### Option 3: iOS-only workaround
- Pros: Limits changes to iOS
- Cons: Fragile user-agent branching, higher maintenance risk

## Selected Design
Use **Option 2**.

### Component Changes
File: `src/components/workout/SetInput.tsx`
- Change weight input from `type="number"` to `type="text"`.
- Keep `inputMode="decimal"` to preserve decimal-oriented mobile keyboard.
- Keep current controlled input update flow (`onChange` updates set state) but route value through a normalization parser that:
  - trims whitespace
  - replaces `,` with `.`
  - parses float
  - converts invalid/negative to `0`
  - truncates to 2 decimals
- Reps input remains unchanged.

### Data Behavior
- Stored weight remains a `number`.
- Parsing output for examples:
  - `"6,5"` -> `6.5`
  - `"6.5"` -> `6.5`
  - `"50,257"` -> `50.25`
  - `"-1"` -> `0`
  - `"abc"` -> `0`

## Error Handling
- Invalid or partial non-numeric user input does not throw; it normalizes to `0` using existing behavior conventions.
- No runtime dependency or browser feature detection is required.

## Testing Strategy

### Unit Tests
File: `tests/unit/components/SetInput.test.tsx`
- Add/adjust tests to verify:
  - comma decimal input (`50,257`) normalizes to `50.25`
  - dot decimal input still normalizes as before
  - invalid and negative inputs normalize to `0`

### E2E Test
File: `tests/e2e/workout-session.spec.ts`
- Add one assertion path in existing workout session flow:
  - fill weight with comma decimal (for example `6,5`)
  - verify persisted `localStorage` workout set weight is numeric `6.5`

## Risks and Mitigations
- Risk: Text input may allow characters beyond digits and separators.
- Mitigation: Parser normalization enforces numeric output and clamps invalid values to `0`.

## Acceptance Criteria
- On iOS Safari, entering `6,5` in weight results in stored value `6.5`.
- Existing dot decimal behavior remains functional.
- Existing invalid/negative normalization behavior remains unchanged.
- Reps input behavior is unchanged.

## Verification Commands (implementation phase)
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test:e2e`
