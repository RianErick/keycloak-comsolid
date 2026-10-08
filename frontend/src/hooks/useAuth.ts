import { useEffect, useState } from 'react'
import { keycloak, keycloakInitPromise } from '@/services/keycloak.service'
import { getCurrentUser } from '@/services/user.service'
import type { User } from '@/types/user'

export function useAuth() {
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [profileAttempt, setProfileAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    keycloakInitPromise
      .then(async () => {
        if (keycloak.authenticated) {
          await keycloak.updateToken(-1).catch(() => undefined)
        }

        if (!cancelled) {
          setReady(true)
        }
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setError('Could not connect to Keycloak. Make sure it is running.')
        setReady(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready || !keycloak.authenticated) {
      return
    }

    let cancelled = false
    setError('')
    getCurrentUser()
      .then((user) => {
        if (!cancelled) {
          setProfile(user)
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Could not load your profile.')
        }
      })
    return () => { cancelled = true }
  }, [profileAttempt, ready])

  const currentUser = keycloak.authenticated
    ? {
        keycloakId: keycloak.tokenParsed?.sub,
        username: keycloak.tokenParsed?.preferred_username,
        isAdmin: keycloak.realmAccess?.roles.includes('admin') ?? false,
        profile,
      }
    : null

  return {
    ready,
    currentUser,
    error,
    retryProfile: () => {
      setProfile(null)
      setProfileAttempt((attempt) => attempt + 1)
    },
  }
}
