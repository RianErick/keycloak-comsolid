import { useState } from 'react'
import axios from 'axios'
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
      setError(getRegistrationError(reason))
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, submit }
}

function getRegistrationError(reason: unknown) {
  if (!axios.isAxiosError(reason)) {
    return reason instanceof Error ? reason.message : 'Could not create your account. Please try again.'
  }

  if (reason.response?.status === 409) {
    return 'That username or email is already in use. Try signing in or use different details.'
  }

  if (reason.response?.status === 400) {
    return 'Some details are invalid. Check the fields and try again.'
  }

  if (reason.code === 'ECONNABORTED' || !reason.response) {
    return 'Could not reach the server. Check your connection and try again.'
  }

  if (reason.response.status >= 500) {
    return 'The account service is unavailable right now. Please try again shortly.'
  }

  return 'Could not create your account. Please try again.'
}
