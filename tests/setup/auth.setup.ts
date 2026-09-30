import { existsSync } from 'node:fs';
import { env } from '../../config/env';
import { ensureSession } from '../../src/auth/authenticate';
import { authFile, roles, type Role } from '../../src/auth/state';
import { expect, test as setup } from '../../src/fixtures';

// AUTH_ROLES (comma-separated) limits which roles are authenticated; default is all.
function selectedRoles(requested: readonly string[] | undefined): Role[] {
  if (!requested) return roles;
  const unknown = requested.filter((role) => !roles.includes(role as Role));
  if (unknown.length > 0) {
    throw new Error(
      `AUTH_ROLES contains unknown roles: ${unknown.join(', ')}. Known: ${roles.join(', ')}`,
    );
  }
  return requested as Role[];
}

// Test titles are generated at load time, so this reads `env` directly rather than via the fixture.
for (const role of selectedRoles(env.auth.roles)) {
  setup(`authenticate as ${role}`, async ({ browser, baseURL }) => {
    const outcome = await ensureSession(
      role,
      { browser, baseURL, credentials: env.users[role] },
      env.auth.maxAgeMinutes,
    );
    setup.info().annotations.push({ type: 'auth', description: `session ${outcome}` });

    expect(existsSync(authFile(role))).toBe(true);
  });
}
