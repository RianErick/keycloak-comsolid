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
        disabled={busy || !canManageUser}
        title={!canManageUser ? 'Only admins can edit other users.' : undefined}
        onClick={() => onEdit(user)}
      >Edit</Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={busy || !canManageUser}
        title={!canManageUser ? 'Only admins can delete other users.' : undefined}
        onClick={confirmDelete}
      >Delete</Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy || !canManageUser}
        title={!canManageUser ? 'Only admins can request email changes for other users.' : undefined}
        onClick={() => onChangeEmail(user.username)}
      >Change email</Button>
    </div>
  )
}
