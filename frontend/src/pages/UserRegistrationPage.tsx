import { UserRegistrationForm } from '@/components/user/forms/UserRegistrationForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegistration } from '@/hooks/useRegistration'

type UserRegistrationPageProps = { onLogin: () => void }

export function UserRegistrationPage({ onLogin }: UserRegistrationPageProps) {
  const registration = useRegistration()

  return (
    <main className="grid min-h-screen w-full place-items-center bg-neutral-300 p-4 sm:p-6">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader className="gap-2 pb-2">
          <CardTitle className="text-2xl">Register a new user</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your details to get started.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <UserRegistrationForm busy={registration.busy} onSubmit={registration.submit} />
          {registration.error && <Alert variant="destructive" role="alert"><AlertDescription>{registration.error}</AlertDescription></Alert>}
          <Button type="button" className="w-full" variant="link" onClick={onLogin}>Already registered? Sign in</Button>
        </CardContent>
      </Card>
    </main>
  )
}
