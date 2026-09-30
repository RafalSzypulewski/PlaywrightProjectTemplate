import { randomUUID } from 'node:crypto';

/** Marks everything the automation creates, so leftovers in a shared environment are identifiable. */
export const AUTO_PREFIX = 'auto';

/** A unique, recognisable value for data that must not collide, e.g. `auto-guest-1a2b3c4d`. */
export function unique(label: string): string {
  return `${AUTO_PREFIX}-${label}-${randomUUID().slice(0, 8)}`;
}
