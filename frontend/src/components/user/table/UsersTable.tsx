import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserEditDialog } from '@/components/user/forms/UserEditDialog'
import { UserRowActions } from '@/components/user/table/UserRowActions'
import { useUsers } from '@/hooks/useUsers'
import type { UserProfile } from '@/types/user'

type UsersTableProps = {
  currentUser: UserProfile | null
  currentUserId?: string
  isAdmin: boolean
}

export function UsersTable({ currentUser, currentUserId, isAdmin }: UsersTableProps) {
  const directory = useUsers()
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const visibleUsers = currentUser
    ? [currentUser, ...directory.users.filter((user) => user.keycloakId !== currentUser.keycloakId)]
    : directory.users

  return (
    <div className="grid gap-4">
      {directory.error && <Alert variant="destructive"><AlertDescription>{directory.error}</AlertDescription></Alert>}
      {directory.message && <Alert><AlertDescription>{directory.message}</AlertDescription></Alert>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="min-w-80">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {directory.loading ? (
            <TableRow><TableCell colSpan={4}>Loading users…</TableCell></TableRow>
          ) : visibleUsers.length === 0 ? (
            <TableRow><TableCell colSpan={4}>No users found.</TableCell></TableRow>
          ) : visibleUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.firstName} {user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <UserRowActions
                  user={user}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  busy={directory.busy}
                  onEdit={setEditingUser}
                  onDelete={directory.remove}
                  onChangeEmail={directory.changeEmail}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{directory.total} users</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={directory.page === 0 || directory.loading} onClick={() => directory.setPage(directory.page - 1)}>Previous</Button>
          <Button size="sm" variant="outline" disabled={directory.page + 1 >= directory.pageCount || directory.loading} onClick={() => directory.setPage(directory.page + 1)}>Next</Button>
        </div>
      </div>
      <UserEditDialog
        key={editingUser?.id ?? 'closed'}
        user={editingUser}
        busy={directory.busy}
        onClose={() => setEditingUser(null)}
        onSave={directory.update}
      />
    </div>
  )
}
