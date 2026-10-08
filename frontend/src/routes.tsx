import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPage } from '@/pages/LoginPage';
import { UserRegistrationPage } from '@/pages/UserRegistrationPage';
import { UsersPage } from '@/pages/UsersPage';
import type { useAuth } from '@/hooks/useAuth';

type AuthSession = ReturnType<typeof useAuth>;

export function AppRoutes({ session }: { session: AuthSession }) {
  const navigate = useNavigate();

  if (!session.ready) {
    return (
      <main className="grid min-h-screen w-full place-items-center bg-neutral-200 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Keycloak Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Connecting to Keycloak…</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session.currentUser ? (
            <Navigate to="/users" replace />
          ) : (
            <LoginPage
              error={session.error}
              onRegister={() => navigate('/register')}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          session.currentUser ? (
            <Navigate to="/users" replace />
          ) : (
            <UserRegistrationPage onLogin={() => navigate('/login')} />
          )
        }
      />
      <Route
        path="/users"
        element={
          session.currentUser ? (
            <UsersPage
              user={session.currentUser.user}
              username={session.currentUser.username}
              userId={session.currentUser.keycloakId}
              isAdmin={session.currentUser.isAdmin}
              error={session.error}
              onRetry={session.retryUser}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={session.currentUser ? '/users' : '/login'} replace />
        }
      />
    </Routes>
  );
}
