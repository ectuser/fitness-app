import { Dumbbell, Home, ListTodo } from 'lucide-react'
import { Link, useLocation } from '@/lib/router-compat'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/workouts', label: 'Workouts', icon: ListTodo },
    { path: '/exercises', label: 'Exercises', icon: Dumbbell },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50 pb-4">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
