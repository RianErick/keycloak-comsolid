import { type FormEvent } from 'react'
import type { UserRegistration } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UserRegistrationFormProps = {
  busy: boolean
  onSubmit: (user: UserRegistration) => void
}

export function UserRegistrationForm({ busy, onSubmit }: UserRegistrationFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-1.5"><Label htmlFor="firstName">First name</Label><Input id="firstName" name="firstName" autoComplete="given-name" required /></div>
      <div className="grid gap-1.5"><Label htmlFor="lastName">Last name</Label><Input id="lastName" name="lastName" autoComplete="family-name" required /></div>
      <div className="grid gap-1.5"><Label htmlFor="username">Username</Label><Input id="username" name="username" autoComplete="username" minLength={3} required /></div>
      <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="grid gap-1.5"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
      <Button className="mt-1 w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
    </form>
  )
}
