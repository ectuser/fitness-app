# Fitness Workout Tracker - Implementation Plan

## Overview
Build a mobile-first fitness workout tracking app with React + TypeScript + Tailwind CSS v4 + shadcn/ui. All data stored in localStorage (no backend, no auth).

## User Requirements Summary
- **Main Screen**: Shows upcoming workout + list of coming workouts
- **Workouts**: Create, edit, delete, duplicate, mark complete/incomplete
- **Active Workout Sessions**: Start a workout, CRUD exercises and sets in real-time, finish workout
- **Exercises**: 10-15 preconfigured + ability to add custom exercises
- **Inline Exercise Creation**: Can create new exercises during workout creation/session without losing progress
- **Workout Structure**: Each workout has exercises → each exercise has sets (weight + reps)
- **Exercise Details**: View stats (max weight, history) from completed workouts only
- **Progress Tracking**: Weight and reps history becomes available after workout completion
- **Mobile-First**: Bottom navigation, touch-friendly inputs, responsive design

## Data Models

### TypeScript Interfaces (src/types/index.ts)
```typescript
type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
type WeightUnit = 'kg' | 'lb';

interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  comments?: string;
  isCustom: boolean;
  createdAt: string;
}

interface Set {
  id: string;
  weight: number;
  weightUnit: WeightUnit;
  reps: number;
}

interface WorkoutExercise {
  exerciseId: string;
  sets: Set[];
  order: number;
}

interface Workout {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  exercises: WorkoutExercise[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Note: Workouts can be in three states:
// 1. Planned - created but not started (isCompleted: false)
// 2. In Progress - being actively performed (isCompleted: false, but in session)
// 3. Completed - finished and logged (isCompleted: true, has completedAt)
// Only completed workouts contribute to exercise statistics.
```

### LocalStorage Structure
- `fitness-app-exercises`: Exercise[]
- `fitness-app-workouts`: Workout[]
- `fitness-app-settings`: { defaultWeightUnit: WeightUnit }

## Architecture

### Folder Structure
```
src/
├── types/index.ts                  # All TypeScript interfaces
├── context/DataContext.tsx         # Global state + localStorage sync
├── lib/
│   ├── utils.ts                    ✓ Exists
│   ├── storage.ts                  # LocalStorage helpers
│   ├── seed-data.ts                # 10-15 preconfigured exercises
│   └── date-utils.ts               # Date formatting
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useWorkouts.ts
│   ├── useExercises.ts
│   └── useExerciseStats.ts
├── components/
│   ├── ui/                         # shadcn components
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   ├── BottomNav.tsx
│   │   └── PageHeader.tsx
│   ├── workout/
│   │   ├── WorkoutCard.tsx
│   │   ├── WorkoutList.tsx
│   │   ├── WorkoutMenu.tsx
│   │   ├── WorkoutExerciseCard.tsx
│   │   ├── SetInput.tsx
│   │   └── ExerciseSelector.tsx
│   ├── exercise/
│   │   ├── ExerciseCard.tsx
│   │   ├── ExerciseDetail.tsx
│   │   ├── ExerciseForm.tsx
│   │   ├── MuscleBadge.tsx
│   │   └── ExerciseHistory.tsx
│   └── dashboard/
│       ├── UpcomingWorkout.tsx
│       └── ComingWorkouts.tsx
└── pages/
    ├── Dashboard.tsx
    ├── WorkoutsPage.tsx
    ├── WorkoutsCompletedPage.tsx
    ├── WorkoutEditPage.tsx
    ├── WorkoutSessionPage.tsx        # Active workout session
    ├── ExercisesPage.tsx
    ├── ExerciseDetailPage.tsx
    └── ExerciseFormPage.tsx
```

### Routing Structure
- `/` - Dashboard (home)
- `/workouts` - All non-completed workouts
- `/workouts/completed` - Completed workouts
- `/workouts/new` - Create workout
- `/workouts/:id/edit` - Edit workout
- `/workouts/:id/session` - **Active workout session** (perform workout)
- `/exercises` - All exercises list
- `/exercises/new` - Create exercise
- `/exercises/:id` - Exercise detail
- `/exercises/:id/edit` - Edit exercise

### State Management
- **DataContext** wraps entire app with exercises, workouts, and CRUD operations
- Syncs with localStorage on every state change
- Provides computed values: upcomingWorkouts, completedWorkouts, nextWorkout
- Custom hooks (useWorkouts, useExercises) for reusable logic

## Implementation Phases

### Phase 1: Foundation (Build First)
**Goal**: Set up data layer, install UI components, create layouts

1. **Install shadcn components**
   ```bash
   npx shadcn@latest add card badge dialog input label select dropdown-menu separator scroll-area alert-dialog
   ```

2. **Create data layer**
   - `src/types/index.ts` - All TypeScript interfaces
   - `src/lib/storage.ts` - LocalStorage utilities
   - `src/lib/seed-data.ts` - 10-15 preconfigured exercises:
     - Bench Press (Chest, Arms)
     - Push-ups (Chest, Arms, Core)
     - Pull-ups (Back, Arms)
     - Deadlift (Back, Legs, Core)
     - Squats (Legs, Core)
     - Shoulder Press (Shoulders, Arms)
     - Bicep Curls (Arms)
     - Tricep Dips (Arms)
     - Plank (Core)
     - + 5-6 more

3. **Create hooks**
   - `src/hooks/useLocalStorage.ts` - Generic localStorage hook
   - `src/hooks/useExercises.ts` - Exercise CRUD operations
   - `src/hooks/useWorkouts.ts` - Workout CRUD operations
   - `src/hooks/useExerciseStats.ts` - Calculate max weight, history

4. **Create DataContext**
   - `src/context/DataContext.tsx`
   - Initialize seed data on first load
   - Sync all state changes to localStorage
   - Export useData() hook for components

5. **Update main.tsx**
   - Wrap App with DataProvider

6. **Create layout components**
   - `src/components/layout/MainLayout.tsx` - App shell
   - `src/components/layout/BottomNav.tsx` - Mobile navigation (Home, Workouts, Exercises)
   - `src/components/layout/PageHeader.tsx` - Reusable page header

7. **Update App.tsx**
   - Replace current routing with MainLayout
   - Add all new routes (placeholder pages for now)

**Critical Files**:
- src/types/index.ts
- src/context/DataContext.tsx
- src/lib/seed-data.ts
- src/components/layout/MainLayout.tsx
- src/main.tsx (modify)
- src/App.tsx (modify)

### Phase 2: Exercise Management
**Goal**: Complete exercise creation, viewing, and management

1. **Create exercise components**
   - `src/components/exercise/ExerciseCard.tsx` - List item
   - `src/components/exercise/MuscleBadge.tsx` - Muscle group badge
   - `src/components/exercise/ExerciseForm.tsx` - Create/edit form
   - `src/components/exercise/ExerciseDetail.tsx` - Full detail view
   - `src/components/exercise/ExerciseHistory.tsx` - Performance timeline

2. **Create exercise pages**
   - `src/pages/ExercisesPage.tsx` - List all exercises
   - `src/pages/ExerciseFormPage.tsx` - Create/edit exercise
   - `src/pages/ExerciseDetailPage.tsx` - View exercise with stats

3. **Implement exercise stats**
   - Calculate max weight from completed workouts
   - Show history of sets from past workouts
   - Display last performed date

**Critical Files**:
- src/components/exercise/ExerciseCard.tsx
- src/components/exercise/ExerciseForm.tsx
- src/pages/ExercisesPage.tsx

### Phase 3: Workout Creation & Editing
**Goal**: Build workout creation interface with exercise selection and set management

1. **Create workout exercise components**
   - `src/components/workout/SetInput.tsx` - Weight + reps input row
   - `src/components/workout/WorkoutExerciseCard.tsx` - Exercise with multiple sets
   - `src/components/workout/ExerciseSelector.tsx` - Dialog to select exercises
     - **IMPORTANT**: Include "Create New Exercise" button in selector
     - Opens inline exercise creation form (nested dialog or tab switch)
     - On save, new exercise is added to list AND auto-selected for workout
     - User returns to workout creation without losing progress

2. **Create workout edit page**
   - `src/pages/WorkoutEditPage.tsx`
   - Form: name, date
   - Add exercise button → opens ExerciseSelector dialog
   - Display selected exercises with SetInput components
   - Reorder exercises (up/down buttons)
   - Add/remove sets per exercise
   - Save/cancel actions

3. **Implement workout logic**
   - Add/remove exercises from workout
   - Add/remove sets from exercises
   - Exercise reordering
   - Inline exercise creation from ExerciseSelector (preserves workout state)
   - Form validation
   - Save to localStorage via DataContext

**Critical Files**:
- src/components/workout/WorkoutExerciseCard.tsx
- src/components/workout/SetInput.tsx
- src/components/workout/ExerciseSelector.tsx
- src/pages/WorkoutEditPage.tsx

### Phase 4: Workout Display & Management
**Goal**: Display workouts, implement actions (delete, duplicate, mark complete)

1. **Create workout display components**
   - `src/components/workout/WorkoutCard.tsx` - Summary card
   - `src/components/workout/WorkoutMenu.tsx` - Three-dots dropdown
   - `src/components/workout/WorkoutList.tsx` - Scrollable list

2. **Create workout pages**
   - `src/pages/WorkoutsPage.tsx` - Non-completed workouts
   - `src/pages/WorkoutsCompletedPage.tsx` - Completed workouts

3. **Implement workout actions**
   - **Start Workout** - Navigate to /workouts/:id/session (KEY ACTION)
   - Delete (with confirmation)
   - Duplicate (copy with new date)
   - Mark complete/incomplete (fallback if not using session)
   - Navigate to edit

**Critical Files**:
- src/components/workout/WorkoutCard.tsx
- src/pages/WorkoutsPage.tsx

### Phase 5: Active Workout Session
**Goal**: Build real-time workout tracking with live exercise and set management

1. **Create workout session page**
   - `src/pages/WorkoutSessionPage.tsx`
   - Full-screen immersive experience
   - Show current exercise being performed
   - Display all exercises in workout with expand/collapse
   - Progress indicator (X of Y exercises completed)

2. **Session functionality**
   - CRUD exercises during session:
     - Add new exercise (opens ExerciseSelector with inline creation)
     - Remove exercise from workout
     - Reorder exercises (up/down buttons or drag-drop)
   - CRUD sets per exercise:
     - Add set (pre-filled with previous set's weight/reps as default)
     - Edit weight/reps in real-time
     - Remove set
     - Optional: Mark individual sets as completed (checkbox)
   - Edit exercise order on the fly

3. **Session controls**
   - **Finish Workout** button (prominent CTA)
     - Confirms completion
     - Sets isCompleted: true, completedAt: timestamp
     - Updates workout in localStorage
     - Navigates back to dashboard or workout list
   - **Cancel/Exit** button
     - Saves progress but doesn't mark complete
     - Returns to previous page
   - Auto-save changes to localStorage as user makes them

4. **Exercise stats integration**
   - After workout completion, exercise stats recalculate
   - Max weight updates if new PR achieved
   - History adds new entries from completed workout

**Critical Files**:
- src/pages/WorkoutSessionPage.tsx
- src/hooks/useExerciseStats.ts (update to calculate from completed workouts)

**UX Notes**:
- Mobile-optimized for gym use
- Large touch targets for weight/reps inputs
- Quick access to add sets (+ button)
- Clear visual distinction from edit mode
- Motivational progress feedback

### Phase 6: Dashboard
**Goal**: Build main screen with upcoming workout and coming workouts

1. **Create dashboard components**
   - `src/components/dashboard/UpcomingWorkout.tsx` - Next workout highlight
   - `src/components/dashboard/ComingWorkouts.tsx` - Upcoming workouts block

2. **Create dashboard page**
   - `src/pages/Dashboard.tsx`
   - Display next workout (upcoming by date) with **"Start Workout"** button
   - Show 3-5 coming workouts (each with "Start" action)
   - "Show All" button → /workouts
   - Quick create workout button
   - Empty states

**Critical Files**:
- src/pages/Dashboard.tsx
- src/components/dashboard/UpcomingWorkout.tsx

### Phase 7: Polish & Mobile Optimization
**Goal**: Refine mobile experience, add utilities, test thoroughly

1. **Date utilities**
   - `src/lib/date-utils.ts`
   - Format dates: "Today", "Tomorrow", relative dates
   - Consistent date display

2. **Mobile optimizations**
   - Test on actual device via Chrome
   - Verify touch targets (min 44px)
   - Test keyboard interactions
   - Add loading states
   - Optimize scroll performance

3. **Testing**
   - Test all CRUD operations
   - Test on mobile device
   - Verify localStorage persistence
   - Test edge cases (empty states, deletions, etc.)

## Mobile-First Design Guidelines

### Bottom Navigation (Mobile)
- Fixed to bottom on screens < 768px
- Icons + labels: Home, Workouts, Exercises
- Active state highlighting
- Switches to top nav on desktop

### Touch-Friendly Inputs
- Minimum 44px tap targets
- Large buttons for increment/decrement
- `inputMode="numeric"` for weight/reps
- Native date picker for workout dates

### Responsive Breakpoints
- Default: < 640px (mobile)
- sm: 640px (large mobile)
- md: 768px (tablet)
- lg: 1024px (desktop)

### Layout Patterns
- Single column on mobile
- Stacked forms with full-width inputs
- Sticky page headers
- Bottom sheets for dialogs

## Key Implementation Decisions

### LocalStorage Strategy
- DataContext as single source of truth
- Auto-sync on every state change
- Initialize from localStorage on mount
- Seed data on first load

### Muscle Groups Calculation
- Derive workout muscles from exercises dynamically
- No data duplication
- Use Set to deduplicate muscles

### Exercise Reordering
- Use simple `order` field (0, 1, 2, ...)
- Up/down buttons (not drag-drop initially)
- Reorder array and reassign order values

### Set Management
- Each set has unique UUID
- Easy add/remove without index confusion
- Simplifies React keys

### Date Handling
- Store as ISO strings (YYYY-MM-DD)
- No timezone issues
- Easy sorting and comparison

### Workout Session vs Edit Mode
- **Edit Mode** (`/workouts/:id/edit`) - Plan workouts, modify template
- **Session Mode** (`/workouts/:id/session`) - Active performance, real-time tracking
- Both can CRUD exercises and sets, but session has:
  - Full-screen immersive UI
  - Progress tracking
  - "Finish Workout" action that marks complete
  - Optimized for gym use (larger touch targets, quick actions)
- Edit mode is for planning, session mode is for executing

## Seed Data (10-15 Exercises)

```typescript
[
  { name: 'Bench Press', muscleGroups: ['Chest', 'Arms'] },
  { name: 'Push-ups', muscleGroups: ['Chest', 'Arms', 'Core'] },
  { name: 'Dumbbell Flyes', muscleGroups: ['Chest'] },
  { name: 'Pull-ups', muscleGroups: ['Back', 'Arms'] },
  { name: 'Bent Over Rows', muscleGroups: ['Back'] },
  { name: 'Deadlift', muscleGroups: ['Back', 'Legs', 'Core'] },
  { name: 'Squats', muscleGroups: ['Legs', 'Core'] },
  { name: 'Lunges', muscleGroups: ['Legs'] },
  { name: 'Leg Press', muscleGroups: ['Legs'] },
  { name: 'Shoulder Press', muscleGroups: ['Shoulders', 'Arms'] },
  { name: 'Lateral Raises', muscleGroups: ['Shoulders'] },
  { name: 'Bicep Curls', muscleGroups: ['Arms'] },
  { name: 'Tricep Dips', muscleGroups: ['Arms'] },
  { name: 'Plank', muscleGroups: ['Core'] },
  { name: 'Russian Twists', muscleGroups: ['Core'] }
]
```

## Critical Files to Create/Modify

### Must Create First (Phase 1)
1. **src/types/index.ts** - All TypeScript interfaces
2. **src/lib/seed-data.ts** - Preconfigured exercises
3. **src/context/DataContext.tsx** - State management + localStorage
4. **src/components/layout/MainLayout.tsx** - App shell
5. **src/components/layout/BottomNav.tsx** - Mobile navigation

### Core Feature Files (Phases 2-5)
6. **src/pages/WorkoutEditPage.tsx** - Workout planning page
7. **src/pages/WorkoutSessionPage.tsx** - Active workout session (CRITICAL)
8. **src/components/workout/WorkoutCard.tsx** - Most reused component
9. **src/components/workout/SetInput.tsx** - Critical UX component
10. **src/pages/ExercisesPage.tsx** - Exercise browsing
11. **src/pages/Dashboard.tsx** - Main entry point with Start Workout action

### Files to Modify
- **src/main.tsx** - Wrap with DataProvider
- **src/App.tsx** - Replace routing with MainLayout + new routes

## Verification & Testing

### Manual Testing Steps
1. **First Load**
   - Open app → verify 15 preconfigured exercises exist
   - Check localStorage in DevTools

2. **Create Workout Flow**
   - Dashboard → Create Workout
   - Add name + date
   - Add 2-3 exercises
   - Add 3 sets to each exercise (with weight/reps)
   - Save workout
   - Verify appears on dashboard

2a. **Inline Exercise Creation During Workout**
   - Start creating new workout
   - Click "Add Exercise" → opens ExerciseSelector
   - Click "Create New Exercise" button
   - Fill in exercise details (name, muscles)
   - Save exercise
   - Verify exercise appears in selector AND is auto-selected
   - Add sets to the new exercise
   - Verify workout state is preserved (name, date, other exercises)
   - Save workout → verify new exercise is included

3. **Active Workout Session** (CRITICAL FLOW)
   - Create a new workout with 2 exercises and some sets
   - From Dashboard or workout list, click "Start Workout"
   - Navigate to workout session page
   - Add a new exercise during session → verify ExerciseSelector works
   - Add sets to exercises (weight + reps)
   - Remove a set
   - Reorder exercises
   - Click "Finish Workout"
   - Verify workout is marked complete
   - Verify workout appears in completed list

4. **Workout Actions**
   - Duplicate workout → verify new date
   - Delete workout → confirm dialog → verify removed
   - Edit workout (before starting session)

5. **Exercise Stats & History** (Test after completing workout)
   - View exercise detail page for an exercise used in completed workout
   - Verify max weight is calculated correctly
   - Verify reps at max weight are shown
   - Verify history shows sets from completed workout
   - Verify stats are empty for exercises not in completed workouts
   - Complete another workout with same exercise at higher weight
   - Verify max weight updates

6. **Custom Exercise Creation**
   - Create custom exercise from exercises page
   - Create custom exercise inline during workout creation
   - Verify both appear in exercise list
   - Add custom exercise to workout and complete it
   - Verify stats calculate correctly

7. **Mobile Testing**
   - Open Chrome DevTools → mobile view
   - Test bottom navigation
   - Test touch targets on workout creation
   - Verify number inputs show numeric keyboard
   - Test scroll behavior on lists

### Using Chrome to Test
- Dev server runs on http://localhost:5173
- Use Chrome DevTools device toolbar for mobile view
- Check Application → LocalStorage for data
- Test on actual mobile device via network URL

## Success Criteria
- ✓ Can create workouts with exercises and sets
- ✓ Can start active workout session and perform workout in real-time
- ✓ Can CRUD exercises and sets during workout session
- ✓ Can finish workout and mark as complete from session
- ✓ Can create new exercises inline during workout creation/session without losing progress
- ✓ Can create custom exercises from exercises page
- ✓ Exercise stats (max weight, history) calculate correctly from completed workouts only
- ✓ Exercise stats update after each workout completion
- ✓ All data persists in localStorage across refreshes
- ✓ Mobile navigation works smoothly
- ✓ Touch targets are appropriately sized for gym use
- ✓ No console errors or warnings

## Potential Issues & Solutions

### Issue: Exercise deletion when used in workouts
**Solution**: Check references before delete, show error if in use

### Issue: LocalStorage size limits (~5-10MB)
**Solution**: Monitor usage, implement cleanup for old data if needed

### Issue: Mobile keyboard covering inputs
**Solution**: Use `scrollIntoView()` on input focus, add bottom padding

### Issue: Date timezone confusion
**Solution**: Store as YYYY-MM-DD strings, use native date input

## Future Enhancements (Post-MVP)
- Progressive Web App (PWA) with offline support
- Progress charts (weight over time)
- Workout templates
- Rest timer between sets
- Export/import data
- Dark mode
- Drag-and-drop exercise reordering
