import type { HandleClientError, HandleServerError, AfterNavigate } from '@sveltejs/kit';

type LR = {
  identify(uid: string, traits?: Record<string, string | number | boolean>): void;
  track(event: string, properties?: Record<string, unknown>): void;
  captureException(error: Error, options?: {
    tags?: Record<string, string | number | boolean>;
    extra?: Record<string, string | number | boolean>;
  }): void;
  log(...args: unknown[]): void;
  getSessionURL(callback: (url: string) => void): void;
};

/**
 * Wrap SvelteKit's client `handleError` to capture exceptions in LogRocket.
 *
 * ```ts
 * // hooks.client.ts
 * import LogRocket from 'logrocket';
 * import { handleError } from 'logrocket-sveltekit';
 * export const handleError = handleError(LogRocket);
 * ```
 */
export function handleError(logrocket: LR): HandleClientError {
  return ({ error, event, status, message }) => {
    const err = error instanceof Error ? error : new Error(String(error));
    logrocket.captureException(err, {
      tags: { route: event.route?.id ?? 'unknown', status: String(status) },
      extra: { pathname: event.url.pathname, message: message ?? '' }
    });
    return { message: message ?? 'Unexpected error' };
  };
}

/**
 * Wrap SvelteKit's server `handleError` to capture exceptions in LogRocket.
 *
 * ```ts
 * // hooks.server.ts
 * import LogRocket from 'logrocket';
 * import { handleServerError } from 'logrocket-sveltekit';
 * export const handleError = handleServerError(LogRocket);
 * ```
 */
export function handleServerError(logrocket: LR): HandleServerError {
  return ({ error, event, status, message }) => {
    const err = error instanceof Error ? error : new Error(String(error));
    logrocket.captureException(err, {
      tags: { route: event.route?.id ?? 'unknown', status: String(status), side: 'server' },
      extra: { pathname: event.url.pathname, message: message ?? '' }
    });
    return { message: message ?? 'Unexpected error' };
  };
}

/**
 * Create an `afterNavigate` callback that tracks route transitions.
 *
 * ```svelte
 * <script>
 *   import LogRocket from 'logrocket';
 *   import { navigate } from 'logrocket-sveltekit';
 *   import { afterNavigate } from '$app/navigation';
 *   afterNavigate(navigate(LogRocket));
 * </script>
 * ```
 */
export function navigate(logrocket: LR): (nav: AfterNavigate) => void {
  let prev: string | null = null;
  return (nav) => {
    const to = nav.to?.route?.id ?? nav.to?.url?.pathname ?? 'unknown';
    logrocket.track('navigation', { from: prev ?? '(entry)', to, type: nav.type });
    prev = to;
  };
}

/**
 * Log a state mutation. Call this inside `$effect()` — the consumer
 * owns the reactive subscription, the library just formats the log.
 *
 * ```ts
 * import LogRocket from 'logrocket';
 * import { logState } from 'logrocket-sveltekit';
 * const log = logState(LogRocket);
 *
 * $effect.root(() => {
 *   $effect(() => log('chatState', { conversations: state.conversations.length }));
 * });
 * ```
 */
export function logState(logrocket: LR): (name: string, snapshot: Record<string, unknown>) => void {
  return (name, snapshot) => {
    logrocket.log(`[state] ${name}`, snapshot);
  };
}

/**
 * Log a Vuex-style mutation with optional sanitizer.
 * Returns null from the sanitizer to suppress.
 *
 * ```ts
 * const log = logMutation(LogRocket, (m) => {
 *   if (m.key === 'secret') return null;
 *   return m;
 * });
 * log('storeName', 'key', value);
 * ```
 */
export function logMutation<T = unknown>(
  logrocket: LR,
  sanitizer: (mutation: { store: string; key: string; value: T }) => { store: string; key: string; value: T } | null = (m) => m
): (store: string, key: string, value: T) => void {
  return (store, key, value) => {
    const sanitized = sanitizer({ store, key, value });
    if (sanitized) {
      logrocket.log('mutation', sanitized);
    }
  };
}
