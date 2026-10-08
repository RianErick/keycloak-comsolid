import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react'
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
    <main className="grid min-h-screen w-full place-items-center bg-neutral-200 p-6">
      <Card className="w-full max-w-sm rounded-2xl py-6 shadow-xl shadow-slate-900/10">
        <CardHeader className="gap-4 px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck aria-hidden="true" className="size-7 shrink-0 text-neutral-700" />
            <CardTitle className="text-2xl font-semibold tracking-tight">Demo Keycloak</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Sign in to continue to your account.</p>
        </CardHeader>
        <CardContent className="grid gap-3 px-6">
          <Button className="h-11 w-full rounded-xl" onClick={() => login()}><KeyRound aria-hidden="true" />Sign in with Keycloak</Button>
          <Button className="h-11 w-full rounded-xl" variant="secondary" onClick={onRegister}><UserPlus aria-hidden="true" />Create an account</Button>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </CardContent>
      </Card>
    </main>
  )
}
