import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { WorkoutsCompletedPage } from './pages/WorkoutsCompletedPage';
import { WorkoutEditPage } from './pages/WorkoutEditPage';
import { WorkoutSessionPage } from './pages/WorkoutSessionPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ExerciseFormPage } from './pages/ExerciseFormPage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';

function App() {
  return (
    <BrowserRouter>
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
