import { UsersRound } from 'lucide-react'
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
    <main className="grid min-h-screen w-full place-items-center bg-neutral-200 p-4 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <UserCard user={user} username={username} error={error} onRetry={onRetry} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UsersRound aria-hidden="true" className="size-6 text-muted-foreground" />Users</CardTitle>
            <CardDescription>Manage users. Email changes and verification use a Keycloak confirmation email.</CardDescription>
          </CardHeader>
          <CardContent><UsersTable currentUser={user} currentUserId={user?.keycloakId ?? userId} isAdmin={isAdmin} /></CardContent>
        </Card>
      </div>
    </main>
  )
}
