import { Link, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/workouts', label: 'Workouts' },
    { path: '/exercises', label: 'Exercises' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Desktop navigation */}
      <nav className="hidden md:block bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">💪 Fitness Tracker</span>
            </div>
            <div className="flex gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">💪 Fitness Tracker</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
