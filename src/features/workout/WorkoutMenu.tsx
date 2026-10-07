import { Check, Copy, Edit, MoreVertical, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { m } from '#/paraglide/messages'
import type { Workout } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface WorkoutMenuProps {
  workout: Workout
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleComplete: () => void
}

export function WorkoutMenu({
  workout,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleComplete,
}: WorkoutMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    onDelete()
    setShowDeleteDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            {m.gentle_olive_lion()}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            {m.odd_olive_elk()}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleComplete}>
            {workout.status === 'completed' ? (
              <>
                <X className="w-4 h-4 mr-2" />
                {m.icy_tan_dove()}
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {m.kind_gold_sloth()}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {m.proud_pearl_moose()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.crisp_mint_dingo()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.gentle_indigo_newt({ name: workout.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.shiny_peach_hare()}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {m.keen_rose_koala()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
