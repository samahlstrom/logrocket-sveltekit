import type { AfterNavigate } from '@sveltejs/kit';
import type LogRocketType from 'logrocket';

type LogRocket = typeof LogRocketType;

/**
 * Creates an `afterNavigate` callback that logs route transitions to LogRocket.
 *
 * Tracks the SvelteKit route ID (e.g. `/[[diseases]]/profile`) rather than
 * just the raw URL, so sessions are searchable by route pattern.
 *
 * Usage in `+layout.svelte`:
 * ```svelte
 * <script>
 *   import LogRocket from 'logrocket';
 *   import { logRocketNavigate } from 'logrocket-sveltekit';
 *   import { afterNavigate } from '$app/navigation';
 *
 *   afterNavigate(logRocketNavigate(LogRocket));
 * </script>
 * ```
 */
export function logRocketNavigate(lr: LogRocket): (nav: AfterNavigate) => void {
  let previousRouteId: string | null = null;

  return (nav: AfterNavigate) => {
    const toRoute = nav.to?.route?.id ?? null;
    const toPath = nav.to?.url?.pathname ?? 'unknown';

    lr.track('navigation', {
      from_route: previousRouteId ?? '(entry)',
      to_route: toRoute ?? toPath,
      to_path: toPath,
      type: nav.type
    });

    previousRouteId = toRoute;
  };
}
