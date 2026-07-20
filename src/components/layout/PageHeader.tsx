import { ArrowLeft } from 'lucide-react'
import { useCanGoBack } from '@tanstack/react-router'
import { useNavigate } from '@/lib/router-compat'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export function PageHeader({
  title,
  showBack = false,
  action,
}: PageHeaderProps) {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  )
}
