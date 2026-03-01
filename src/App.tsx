import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { WorkoutsCompletedPage } from './pages/WorkoutsCompletedPage';
import { WorkoutEditPage } from './pages/WorkoutEditPage';
import { WorkoutSessionPage } from './pages/WorkoutSessionPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ExerciseFormPage } from './pages/ExerciseFormPage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from './lib/storage';

const RESTORABLE_ROUTES = [
  '/',
  '/workouts',
  '/workouts/completed',
  '/workouts/new',
  '/workouts/:id/edit',
  '/workouts/:id/session',
  '/exercises',
  '/exercises/new',
  '/exercises/:id',
  '/exercises/:id/edit',
];

function isRestorableRoute(pathname: string): boolean {
  return RESTORABLE_ROUTES.some((routePattern) =>
    Boolean(matchPath({ path: routePattern, end: true }, pathname))
  );
}

function LastVisitedRouteHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const hasRestoredRef = useRef(false);
  const restoreTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (hasRestoredRef.current) {
      return;
    }

    const savedPath = getFromStorage<string>(STORAGE_KEYS.LAST_VISITED_PATH, '/');

    if (
      location.pathname === '/' &&
      savedPath &&
      savedPath !== '/' &&
      isRestorableRoute(savedPath)
    ) {
      restoreTargetRef.current = savedPath;
      navigate(savedPath, { replace: true });
    }

    hasRestoredRef.current = true;
    setIsInitialized(true);
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isRestorableRoute(location.pathname)) {
      return;
    }

    if (restoreTargetRef.current && location.pathname !== restoreTargetRef.current) {
      return;
    }

    saveToStorage(STORAGE_KEYS.LAST_VISITED_PATH, location.pathname);
    if (restoreTargetRef.current === location.pathname) {
      restoreTargetRef.current = null;
    }
  }, [isInitialized, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter basename="/fitness-app">
      <LastVisitedRouteHandler />
      <MainLayout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Workouts */}
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workouts/completed" element={<WorkoutsCompletedPage />} />
          <Route path="/workouts/new" element={<WorkoutEditPage />} />
          <Route path="/workouts/:id/edit" element={<WorkoutEditPage />} />
          <Route path="/workouts/:id/session" element={<WorkoutSessionPage />} />

          {/* Exercises */}
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/new" element={<ExerciseFormPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/exercises/:id/edit" element={<ExerciseFormPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
