import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logout } from '@/services/keycloak.service'
import type { UserProfile } from '@/types/user'

type UserProfileCardProps = {
  profile: UserProfile | null
  username?: string
  error: string
  onRetry: () => void
}

export function UserProfileCard({ profile, username, error, onRetry }: UserProfileCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Hello, {profile?.firstName || username}</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        {profile ? (
          <dl className="grid grid-cols-[90px_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">Username</dt><dd className="break-words">{profile.username}</dd>
            <dt className="text-muted-foreground">Email</dt><dd className="break-words">{profile.email}</dd>
            {profile.description && <><dt className="text-muted-foreground">Description</dt><dd className="break-words">{profile.description}</dd></>}
          </dl>
        ) : !error ? <p>Loading profile…</p> : null}
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {error && <Button className="w-full" variant="outline" onClick={onRetry}>Retry</Button>}
        <Button className="w-full" variant="secondary" onClick={() => logout()}>Sign out</Button>
      </CardContent>
    </Card>
  )
}
