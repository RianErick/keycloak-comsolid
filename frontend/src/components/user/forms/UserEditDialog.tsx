import { type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserProfile, UserUpdate } from '@/types/user'

type UserEditDialogProps = {
  user: UserProfile | null
  busy: boolean
  onClose: () => void
  onSave: (username: string, changes: UserUpdate) => Promise<boolean>
}

export function UserEditDialog({ user, busy, onClose, onSave }: UserEditDialogProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const form = new FormData(event.currentTarget)
    const changes: UserUpdate = {
      username: String(form.get('username') ?? ''),
      firstName: String(form.get('firstName') ?? ''),
      lastName: String(form.get('lastName') ?? ''),
      description: String(form.get('description') ?? ''),
    }

    if (await onSave(user.username, changes)) onClose()
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>Update the account details.</DialogDescription>
        </DialogHeader>
        {user && (
          <form id="edit-user-form" className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-1.5"><Label htmlFor="edit-username">Username</Label><Input id="edit-username" name="username" defaultValue={user.username} minLength={3} required /></div>
            <div className="grid gap-1.5"><Label htmlFor="edit-first-name">First name</Label><Input id="edit-first-name" name="firstName" defaultValue={user.firstName} required /></div>
            <div className="grid gap-1.5"><Label htmlFor="edit-last-name">Last name</Label><Input id="edit-last-name" name="lastName" defaultValue={user.lastName} required /></div>
            <div className="grid gap-1.5"><Label htmlFor="edit-description">Description</Label><Input id="edit-description" name="description" defaultValue={user.description ?? ''} /></div>
          </form>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-user-form" disabled={busy || !user}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
