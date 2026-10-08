import { UsersTable } from '@/components/user/table/UsersTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCard } from '@/components/user/UserCard'
import type { User } from '@/types/user'

type UsersPageProps = {
  user: User | null
  username?: string
  userId?: string
  isAdmin: boolean
  error: string
  onRetry: () => void
}

export function UsersPage({ user, username, userId, isAdmin, error, onRetry }: UsersPageProps) {
  return (
    <main className="min-h-screen w-full bg-neutral-300 p-6">
      <div className="mx-auto grid max-w-6xl gap-6">
        <UserCard user={user} username={username} error={error} onRetry={onRetry} />
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage users. Email changes and verification use a Keycloak confirmation email.</CardDescription>
          </CardHeader>
          <CardContent><UsersTable currentUser={user} currentUserId={user?.keycloakId ?? userId} isAdmin={isAdmin} /></CardContent>
        </Card>
      </div>
    </main>
  )
}
