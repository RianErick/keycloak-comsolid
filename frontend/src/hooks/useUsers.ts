import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeEmail,
  deleteUser,
  searchUsers,
  updateUser,
} from '@/services/user.service';
import type { UserUpdate } from '@/types/user';

const PAGE_SIZE = 10;

type UserAction =
  | { type: 'update'; username: string; changes: UserUpdate }
  | { type: 'delete'; username: string }
  | { type: 'changeEmail'; username: string };

const successMessages: Record<UserAction['type'], string> = {
  update: 'User updated.',
  delete: 'User deleted.',
  changeEmail: 'Email change confirmation sent.',
};

export function useUsers() {
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ['users', 'list', page, PAGE_SIZE],
    queryFn: () => searchUsers(page, PAGE_SIZE),
  });

  const actionMutation = useMutation({
    mutationFn: (action: UserAction) => {
      switch (action.type) {
        case 'update':
          return updateUser(action.username, action.changes);
        case 'delete':
          return deleteUser(action.username);
        case 'changeEmail':
          return changeEmail(action.username);
      }
    },
    onMutate: () => setMessage(''),
    onSuccess: async (_data, action) => {
      setMessage(successMessages[action.type]);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    query: usersQuery,
    page,
    setPage,
    actions: {
      busy: actionMutation.isPending,
      error:
        actionMutation.error instanceof Error
          ? actionMutation.error.message
          : actionMutation.error
            ? 'The request failed.'
            : '',
      update: async (username: string, changes: UserUpdate) => {
        try {
          await actionMutation.mutateAsync({
            type: 'update',
            username,
            changes,
          });
          return true;
        } catch {
          return false;
        }
      },
      remove: async (username: string) => {
        try {
          await actionMutation.mutateAsync({ type: 'delete', username });
          return true;
        } catch {
          return false;
        }
      },
      changeEmail: (username: string) =>
        actionMutation.mutate({ type: 'changeEmail', username }),
    },
    message,
  };
}
