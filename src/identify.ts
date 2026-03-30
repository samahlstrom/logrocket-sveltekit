import type LogRocketType from 'logrocket';

type LogRocket = typeof LogRocketType;

export interface IdentifyOptions {
  /** User's unique ID */
  uid: string;
  /** User's email */
  email?: string;
  /** User's display name */
  name?: string;
  /** Any extra traits to attach to the LogRocket user */
  traits?: Record<string, string | number | boolean>;
}

/**
 * Identifies the current user in LogRocket with standard SvelteKit conventions.
 *
 * Usage in `+layout.svelte` or an auth callback:
 * ```ts
 * import LogRocket from 'logrocket';
 * import { identifyUser } from 'logrocket-sveltekit';
 *
 * identifyUser(LogRocket, {
 *   uid: user.uid,
 *   email: user.email,
 *   name: user.displayName
 * });
 * ```
 */
export function identifyUser(lr: LogRocket, options: IdentifyOptions): void {
  const { uid, email, name, traits } = options;

  lr.identify(uid, {
    ...(email && { email }),
    ...(name && { name }),
    ...traits
  });
}
