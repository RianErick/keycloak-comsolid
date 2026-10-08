import { api } from '@/services/api';
import type { Page } from '@/types/page';
import type { User, UserRegistration, UserUpdate } from '@/types/user';
import { getAccessToken } from '@/services/keycloak.service';

export async function searchUsers(
  pageNumber: number,
  pageSize: number,
): Promise<Page<User>> {
  return (
    await api.get<Page<User>>('/v1/users', {
      params: { pageNumber, pageSize, orderBy: 'username' },
    })
  ).data;
}

export async function getCurrentUser(): Promise<User> {
  const token = await getAccessToken();
  return (
    await api.get<User>('/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}

export async function registerUser(user: UserRegistration): Promise<void> {
  await api.post('/v1/users', user);
}

export async function updateUser(
  username: string,
  user: UserUpdate,
): Promise<void> {
  const token = await getAccessToken();
  await api.put(`/v1/users/${encodeURIComponent(username)}`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function changeEmail(username: string): Promise<void> {
  const token = await getAccessToken();
  await api.patch(
    `/v1/users/${encodeURIComponent(username)}/email`,
    undefined,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function deleteUser(username: string): Promise<void> {
  const token = await getAccessToken();
  await api.delete(`/v1/users/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
