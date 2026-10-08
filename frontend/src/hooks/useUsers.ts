import { useEffect, useState } from 'react'
import {
  deleteUser,
  changeEmail,
  searchUsers,
  updateUser,
} from '@/services/user.service'
import type { User, UserUpdate } from '@/types/user'

const PAGE_SIZE = 10

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    async function loadPage() {
      try {
        const result = await searchUsers(page, PAGE_SIZE)
        if (cancelled) {
          return
        }

        setUsers(result.content)
        setTotal(result.pageable.total)
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Could not load users.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPage()
    return () => { cancelled = true }
  }, [page, refreshVersion])

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      setMessage(successMessage)
      setRefreshVersion((version) => version + 1)
      return true
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The request failed.')
      return false
    } finally {
      setBusy(false)
    }
  }

  return {
    users,
    page,
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    loading,
    busy,
    error,
    message,
    setPage,
    update: (username: string, user: UserUpdate) =>
      runAction(() => updateUser(username, user), 'User updated.'),
    remove: (username: string) =>
      runAction(() => deleteUser(username), 'User deleted.'),
    changeEmail: (username: string) =>
      runAction(() => changeEmail(username), 'Email change confirmation sent.'),
  }
}
