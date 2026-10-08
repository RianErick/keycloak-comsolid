export type UserProfile = {
  id: string
  keycloakId: string
  username: string
  email: string
  firstName: string
  lastName: string
  description?: string
}

export type UserUpdate = Pick<UserProfile, 'username' | 'firstName' | 'lastName'> & {
  description?: string
}

export type UserSearchPage = {
  content: UserProfile[]
  pageable: {
    pageNumber: number
    pageSize: number
    total: number
  }
}

export type UserRegistration = {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}
