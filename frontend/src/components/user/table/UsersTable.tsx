import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserEditDialog } from '@/components/user/forms/UserEditDialog';
import { UserRowActions } from '@/components/user/table/UserRowActions';
import { useUsers } from '@/hooks/useUsers';
import { logout } from '@/services/keycloak.service';
import type { User } from '@/types/user';

type UsersTableProps = {
  currentUser: User | null;
  currentUserId?: string;
  isAdmin: boolean;
};

export function UsersTable({
  currentUser,
  currentUserId,
  isAdmin,
}: UsersTableProps) {
  const directory = useUsers();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const users = directory.query.data?.content ?? [];
  const total = directory.query.data?.pageable.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / 10));
  const visibleUsers = currentUser
    ? [
        currentUser,
        ...users.filter((user) => user.keycloakId !== currentUser.keycloakId),
      ]
    : users;

  const error =
    directory.actions.error ||
    (directory.query.error instanceof Error
      ? directory.query.error.message
      : directory.query.error
        ? 'Could not load users.'
        : '');

  async function deleteUser(username: string) {
    const deleted = await directory.actions.remove(username);
    if (deleted && username === currentUser?.username) await logout();
  }

  return (
    <div className="grid gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {directory.message && (
        <Alert>
          <AlertDescription>{directory.message}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="min-w-[25rem]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {directory.query.isFetching ? (
            <TableRow>
              <TableCell colSpan={4}>Loading users…</TableCell>
            </TableRow>
          ) : visibleUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No users found.</TableCell>
            </TableRow>
          ) : (
            visibleUsers.map((user) => (
              <TableRow
                key={user.id}
                className={
                  user.keycloakId === currentUserId
                    ? '[&>td:first-child]:border-l-4 [&>td:first-child]:border-l-neutral-600'
                    : undefined
                }
              >
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <UserRowActions
                    user={user}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    busy={directory.actions.busy}
                    onEdit={setEditingUser}
                    onDelete={(username) => {
                      void deleteUser(username);
                    }}
                    onChangeEmail={directory.actions.changeEmail}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} users</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={directory.page === 0 || directory.query.isFetching}
            onClick={() => directory.setPage(directory.page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={
              directory.page + 1 >= pageCount || directory.query.isFetching
            }
            onClick={() => directory.setPage(directory.page + 1)}
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <UserEditDialog
        key={editingUser?.id ?? 'closed'}
        user={editingUser}
        busy={directory.actions.busy}
        onClose={() => setEditingUser(null)}
        onSave={directory.actions.update}
      />
    </div>
  );
}
