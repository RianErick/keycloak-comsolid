import { useState } from 'react'
import { login } from '@/services/keycloak.service'
import { registerUser } from '@/services/user.service'
import type { UserRegistration } from '@/types/user'

export function useRegistration() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(user: UserRegistration) {
    setBusy(true)
    setError('')
    try {
      await registerUser(user)
      await login(user.username)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, submit }
}
