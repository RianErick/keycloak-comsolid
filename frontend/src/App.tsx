import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/LoginPage'
import { UserRegistrationPage } from '@/pages/UserRegistrationPage'
import { UsersPage } from '@/pages/UsersPage'

function App() {
  const [registering, setRegistering] = useState(false)
  const session = useAuth()

  if (!session.ready) {
    return (
      <main className="grid min-h-screen w-full place-items-center bg-neutral-300 p-6">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-xl">Demo Keycloak</CardTitle></CardHeader>
          <CardContent><p>Connecting to Keycloak…</p></CardContent>
        </Card>
      </main>
    )
  }

  if (session.currentUser) {
    return (
      <UsersPage
        user={session.currentUser.user}
        username={session.currentUser.username}
        userId={session.currentUser.keycloakId}
        isAdmin={session.currentUser.isAdmin}
        error={session.error}
        onRetry={session.retryUser}
      />
    )
  }

  if (registering) {
    return <UserRegistrationPage onLogin={() => setRegistering(false)} />
  }

  return <LoginPage error={session.error} onRegister={() => setRegistering(true)} />
}

export default App
