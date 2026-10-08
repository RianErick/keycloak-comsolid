import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { keycloak, keycloakInit } from '@/services/keycloak.service'
import { getCurrentUser } from '@/services/user.service'

type KeycloakStatus = 'initializing' | 'ready' | 'error'

export function useAuth() {
  const [keycloakStatus, setKeycloakStatus] = useState<KeycloakStatus>('initializing')

  useEffect(() => {
    let cancelled = false
    keycloakInit
      .then(async () => {
        if (keycloak.authenticated) await keycloak.updateToken(-1).catch(() => undefined)
        if (!cancelled) setKeycloakStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setKeycloakStatus('error')
      })

    return () => { cancelled = true }
  }, [])

  const userQuery = useQuery({
    queryKey: ['users', 'current'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60_000,
    enabled: keycloakStatus === 'ready' && Boolean(keycloak.authenticated),
  })

  const currentUser = keycloak.authenticated
    ? {
        keycloakId: keycloak.tokenParsed?.sub,
        username: keycloak.tokenParsed?.preferred_username,
        isAdmin: keycloak.realmAccess?.roles.includes('admin') ?? false,
        user: userQuery.data ?? null,
      }
    : null

  return {
    ready: keycloakStatus !== 'initializing',
    currentUser,
    error: keycloakStatus === 'error'
      ? 'Could not connect to Keycloak. Make sure it is running.'
      : userQuery.error instanceof Error ? userQuery.error.message : '',
    retryUser: () => { void userQuery.refetch() },
  }
}
