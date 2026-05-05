export function getReturnToWorkoutPathFromSearch(search: string): string | null {
  const returnTo = new URLSearchParams(search).get('returnTo');
  if (!returnTo) {
    return null;
  }

  if (returnTo === '/workouts/new' || /^\/workouts\/[^/]+\/edit$/.test(returnTo)) {
    return returnTo;
  }

  return null;
}
