import { api } from '@/services/api'
import type { UserProfile, UserRegistration, UserSearchPage, UserUpdate } from '@/types/user'
import { getAccessToken } from '@/services/keycloak.service'

export async function getCurrentUser(): Promise<UserProfile> {
  const token = await getAccessToken()
  const response = await api.get<UserProfile>('/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function registerUser(user: UserRegistration): Promise<void> {
  await api.post('/v1/users', user)
}

export async function searchUsers(pageNumber: number, pageSize: number): Promise<UserSearchPage> {
  const response = await api.get<UserSearchPage>('/v1/users', {
    params: { pageNumber, pageSize, orderBy: 'username' },
  })
  return response.data
}

export async function updateUser(username: string, user: UserUpdate): Promise<void> {
  const token = await getAccessToken()
  await api.put(`/v1/users/${encodeURIComponent(username)}`, user, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function deleteUser(username: string): Promise<void> {
  const token = await getAccessToken()
  await api.delete(`/v1/users/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function changeEmail(username: string): Promise<void> {
  const token = await getAccessToken()
  await api.patch(`/v1/users/${encodeURIComponent(username)}/email`, undefined, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
