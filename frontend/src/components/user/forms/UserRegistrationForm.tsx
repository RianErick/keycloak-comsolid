import { type SubmitEvent } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { UserRegistration } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UserRegistrationFormProps = {
  busy: boolean
  onSubmit: (user: UserRegistration) => void
}

export function UserRegistrationForm({ busy, onSubmit }: UserRegistrationFormProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      firstName: String(form.get('firstName') ?? ''),
      lastName: String(form.get('lastName') ?? ''),
      username: String(form.get('username') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    })
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="firstName">First name</Label><Input id="firstName" name="firstName" autoComplete="given-name" maxLength={50} required /></div>
        <div className="grid gap-2"><Label htmlFor="lastName">Last name</Label><Input id="lastName" name="lastName" autoComplete="family-name" maxLength={50} required /></div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" minLength={3} maxLength={50} pattern="[a-zA-Z0-9._-]+" aria-describedby="username-hint" required />
        <p id="username-hint" className="text-xs text-muted-foreground">At least 3 characters. Letters, numbers, dots, hyphens, and underscores.</p>
      </div>
      <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="password-hint" required />
        <p id="password-hint" className="text-xs text-muted-foreground">Use at least 8 characters.</p>
      </div>
      <Button type="submit" className="mt-1 h-10 w-full" disabled={busy}>
        {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        {busy ? 'Registering…' : 'Register'}
      </Button>
    </form>
  )
}
