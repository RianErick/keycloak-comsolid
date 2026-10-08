import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logout } from '@/services/keycloak.service'
import type { User } from '@/types/user'

type UserCardProps = {
  user: User | null
  username?: string
  error: string
  onRetry: () => void
}

export function UserCard({ user, username, error, onRetry }: UserCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Hello, {user?.firstName || username}</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        {user ? (
          <dl className="grid grid-cols-[90px_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">Username</dt><dd className="break-words">{user.username}</dd>
            <dt className="text-muted-foreground">Email</dt><dd className="break-words">{user.email}</dd>
            {user.description && <><dt className="text-muted-foreground">Description</dt><dd className="break-words">{user.description}</dd></>}
          </dl>
        ) : !error ? <p>Loading user details…</p> : null}
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {error && <Button className="w-full" variant="outline" onClick={onRetry}>Retry</Button>}
        <Button className="w-full" variant="secondary" onClick={() => logout()}>Sign out</Button>
      </CardContent>
    </Card>
  )
}
