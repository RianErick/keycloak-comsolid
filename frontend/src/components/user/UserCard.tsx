import { LogOut, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/services/keycloak.service';
import type { User } from '@/types/user';

type UserCardProps = {
  user: User | null;
  username?: string;
  error: string;
  onRetry: () => void;
};

export function UserCard({ user, username, error, onRetry }: UserCardProps) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="flex flex-col items-center gap-3 text-xl">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-6" />
          </span>
          <span>Hello, {user?.firstName || username}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid justify-items-center gap-4 text-center">
        {user ? (
          <dl className="grid grid-cols-[90px_auto] gap-x-3 gap-y-2 text-left text-sm">
            <dt className="text-muted-foreground">Username</dt>
            <dd className="break-words">{user.username}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="break-words">{user.email}</dd>
            {user.description && (
              <>
                <dt className="text-muted-foreground">Description</dt>
                <dd className="break-words">{user.description}</dd>
              </>
            )}
          </dl>
        ) : !error ? (
          <p>Loading user details…</p>
        ) : null}
        {error && (
          <Alert className="w-full max-w-xl text-left" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
        <Button
          variant="outline"
          className="h-9 rounded-lg border-red-400 bg-white px-4 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => logout()}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
