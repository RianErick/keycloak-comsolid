export type User = {
  id: string
  keycloakId: string
  username: string
  email: string
  firstName: string
  lastName: string
  description?: string
}

export type UserUpdate = Pick<User, 'username' | 'firstName' | 'lastName'> & {
  description?: string
}

export type UserRegistration = {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}
