import type { HandleClientError, HandleServerError } from '@sveltejs/kit';
import type LogRocketType from 'logrocket';

type LogRocket = typeof LogRocketType;

export interface ErrorHandlerOptions {
  /** Extra tags added to every captured error */
  tags?: Record<string, string>;
}

/**
 * Wraps SvelteKit's client-side `handleError` hook to capture errors in LogRocket.
 *
 * Usage in `hooks.client.ts`:
 * ```ts
 * import LogRocket from 'logrocket';
 * import { withLogRocketError } from 'logrocket-sveltekit';
 *
 * export const handleError = withLogRocketError(LogRocket);
 * ```
 */
export function withLogRocketError(
  lr: LogRocket,
  options?: ErrorHandlerOptions
): HandleClientError {
  return ({ error, event, status, message }) => {
    const routeId = event.route?.id ?? 'unknown';

    const tags: Record<string, string | number | boolean> = {
      routeId,
      pathname: event.url.pathname,
      status: String(status),
      ...options?.tags
    };

    const extra: Record<string, string | number | boolean> = {};
    if (message) extra.message = message;
    if (event.params) {
      for (const [k, v] of Object.entries(event.params)) {
        if (v != null) extra[`param_${k}`] = v;
      }
    }

    lr.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags,
      extra
    });

    return { message: message ?? 'Unexpected error' };
  };
}

/**
 * Wraps SvelteKit's server-side `handleError` hook to capture errors in LogRocket.
 *
 * Usage in `hooks.server.ts`:
 * ```ts
 * import LogRocket from 'logrocket';
 * import { withLogRocketServerError } from 'logrocket-sveltekit';
 *
 * export const handleError = withLogRocketServerError(LogRocket);
 * ```
 */
export function withLogRocketServerError(
  lr: LogRocket,
  options?: ErrorHandlerOptions
): HandleServerError {
  return ({ error, event, status, message }) => {
    const routeId = event.route?.id ?? 'unknown';

    const tags: Record<string, string | number | boolean> = {
      routeId,
      pathname: event.url.pathname,
      status: String(status),
      side: 'server',
      ...options?.tags
    };

    const extra: Record<string, string | number | boolean> = {};
    if (message) extra.message = message;

    lr.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags,
      extra
    });

    return { message: message ?? 'Unexpected error' };
  };
}
