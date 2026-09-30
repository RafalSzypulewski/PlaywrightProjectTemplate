import type { Credentials } from '../pages/login.page';

// Users that cannot (or must not) authenticate, for unauthenticated login tests. Identities that
// tests sign in as are roles: see src/auth/state.ts and the credentials in env.
// Public demo credentials published by the demo application.
export const users = {
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
} as const satisfies Record<string, Credentials>;

export type Users = typeof users;
