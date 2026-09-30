import type { Credentials } from '../pages/login.page';

// Public demo credentials published by the demo application. Real projects read credentials from
// env (see config/env.schema.ts) or create users through an API fixture.
export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
} as const satisfies Record<string, Credentials>;

export type Users = typeof users;
