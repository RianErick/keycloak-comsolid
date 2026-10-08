import { UserRegistrationForm } from '@/components/user/forms/UserRegistrationForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegistration } from '@/hooks/useRegistration'

type UserRegistrationPageProps = { onLogin: () => void }

export function UserRegistrationPage({ onLogin }: UserRegistrationPageProps) {
  const registration = useRegistration()

  return (
    <main className="grid min-h-screen w-full place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-xl">Create account</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <UserRegistrationForm busy={registration.busy} onSubmit={registration.submit} />
          {registration.error && <Alert variant="destructive"><AlertDescription>{registration.error}</AlertDescription></Alert>}
          <Button className="w-full" variant="link" onClick={onLogin}>Back to sign in</Button>
        </CardContent>
      </Card>
    </main>
  )
}
