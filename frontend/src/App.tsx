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
      <main className="grid min-h-screen w-full place-items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-xl">Demo Keycloak</CardTitle></CardHeader>
          <CardContent><p>Connecting to Keycloak…</p></CardContent>
        </Card>
      </main>
    )
  }

  if (session.authenticated) {
    return (
      <UsersPage
        profile={session.profile}
        username={session.username}
        userId={session.userId}
        isAdmin={session.isAdmin}
        error={session.error}
        onRetry={session.retryProfile}
      />
    )
  }

  if (registering) {
    return <UserRegistrationPage onLogin={() => setRegistering(false)} />
  }

  return <LoginPage error={session.error} onRegister={() => setRegistering(true)} />
}

export default App
