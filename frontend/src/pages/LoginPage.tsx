import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/services/keycloak.service'

type LoginPageProps = {
  error: string
  onRegister: () => void
}

export function LoginPage({ error, onRegister }: LoginPageProps) {
  return (
    <main className="grid min-h-screen w-full place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-xl">Demo Keycloak</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
          <Button className="w-full" onClick={() => login()}>Sign in with Keycloak</Button>
          <Button className="w-full" variant="secondary" onClick={onRegister}>Create account</Button>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </CardContent>
      </Card>
    </main>
  )
}
