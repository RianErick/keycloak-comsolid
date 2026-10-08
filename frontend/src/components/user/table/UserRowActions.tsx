import { Mail, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'

type UserRowActionsProps = {
  user: User
  currentUserId?: string
  isAdmin: boolean
  busy: boolean
  onEdit: (user: User) => void
  onDelete: (username: string) => void
  onChangeEmail: (username: string) => void
}

export function UserRowActions({
  user,
  currentUserId,
  isAdmin,
  busy,
  onEdit,
  onDelete,
  onChangeEmail,
}: UserRowActionsProps) {
  const canManageUser = isAdmin || user.keycloakId === currentUserId
  function confirmDelete() {
    if (window.confirm(`Delete user ${user.username}?`)) onDelete(user.username)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-32 shrink-0 justify-center rounded-md border-neutral-400 bg-white px-3 text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900"
        disabled={busy || !canManageUser}
        title={!canManageUser ? 'Only admins can edit other users.' : undefined}
        onClick={() => onEdit(user)}
      ><Pencil aria-hidden="true" />Edit</Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-32 shrink-0 justify-center rounded-md border-neutral-400 bg-white px-3 text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900"
        disabled={busy || !canManageUser}
        title={!canManageUser ? 'Only admins can request email changes for other users.' : undefined}
        onClick={() => onChangeEmail(user.username)}
      ><Mail aria-hidden="true" />Change email</Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-32 shrink-0 justify-center rounded-md border-red-400 bg-white px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={busy || !canManageUser}
        title={!canManageUser ? 'Only admins can delete other users.' : undefined}
        onClick={confirmDelete}
      ><Trash2 aria-hidden="true" />Delete</Button>
    </div>
  )
}
