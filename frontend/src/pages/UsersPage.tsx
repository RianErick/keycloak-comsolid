import { UsersTable } from '@/components/user/table/UsersTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserProfileCard } from '@/components/user/UserProfileCard'
import type { UserProfile } from '@/types/user'

type UsersPageProps = {
  profile: UserProfile | null
  username?: string
  userId?: string
  isAdmin: boolean
  error: string
  onRetry: () => void
}

export function UsersPage({ profile, username, userId, isAdmin, error, onRetry }: UsersPageProps) {
  return (
    <main className="min-h-screen w-full p-6">
      <div className="mx-auto grid max-w-6xl gap-6">
        <UserProfileCard profile={profile} username={username} error={error} onRetry={onRetry} />
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Email changes use a Keycloak confirmation email. Resending verification is restricted to admins.</CardDescription>
          </CardHeader>
          <CardContent><UsersTable currentUserId={profile?.keycloakId ?? userId} isAdmin={isAdmin} /></CardContent>
        </Card>
      </div>
    </main>
  )
}
