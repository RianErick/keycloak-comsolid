import { useState } from 'react';
import { ChevronDown, KeyRound, LogOut, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { keycloak, logout } from '@/services/keycloak.service';
import type { User } from '@/types/user';

type UserCardProps = {
  user: User | null;
  username?: string;
  error: string;
  onRetry: () => void;
};

export function UserCard({ user, username, error, onRetry }: UserCardProps) {
  const [showToken, setShowToken] = useState(false);

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
        <div className="grid w-full justify-items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground"
            aria-expanded={showToken}
            aria-controls="access-token-claims"
            onClick={() => setShowToken((visible) => !visible)}
          >
            <KeyRound aria-hidden="true" className="size-4" />
            Token details
            <ChevronDown
              aria-hidden="true"
              className={`size-4 transition-transform ${showToken ? 'rotate-180' : ''}`}
            />
          </Button>
          {showToken && (
            <pre
              id="access-token-claims"
              className="max-h-96 w-full overflow-auto rounded-lg bg-neutral-950 p-4 text-left text-xs text-neutral-100"
              aria-label="Decoded access token claims"
            >
              {JSON.stringify(keycloak.tokenParsed ?? {}, null, 2)}
            </pre>
          )}
        </div>
        <Button
          variant="ghost"
          className="h-8 gap-2 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => logout()}
        >
          <LogOut aria-hidden="true" className="size-4" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
