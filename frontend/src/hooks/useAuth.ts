import { useCallback, useEffect, useState } from 'react'
import { keycloak, keycloakInitPromise } from '@/services/keycloak.service'
import { getCurrentUser } from '@/services/user.service'
import type { UserProfile } from '@/types/user'

export function useAuth() {
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [profileAttempt, setProfileAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    keycloakInitPromise
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not connect to Keycloak. Make sure it is running.')
        setReady(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready || !keycloak.authenticated) return
    let cancelled = false
    setError('')
    getCurrentUser()
      .then((user) => {
        if (!cancelled) setProfile(user)
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Could not load your profile.')
        }
      })
    return () => { cancelled = true }
  }, [keycloak, profileAttempt, ready])

  const retryProfile = useCallback(() => {
    setError('')
    setProfile(null)
    setProfileAttempt((attempt) => attempt + 1)
  }, [])

  return {
    ready,
    authenticated: Boolean(keycloak.authenticated),
    username: keycloak.tokenParsed?.preferred_username,
    userId: keycloak.tokenParsed?.sub,
    isAdmin: keycloak.realmAccess?.roles.includes('admin') ?? false,
    profile,
    error,
    retryProfile,
  }
}
