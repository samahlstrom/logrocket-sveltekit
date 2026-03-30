import type LogRocketType from 'logrocket';

type LogRocket = typeof LogRocketType;

/**
 * Reactively provides the LogRocket session URL using Svelte 5 runes.
 *
 * Returns a getter function that can be used in templates or effects.
 *
 * Usage in a component:
 * ```svelte
 * <script>
 *   import LogRocket from 'logrocket';
 *   import { createSessionURL } from 'logrocket-sveltekit';
 *
 *   const sessionURL = createSessionURL(LogRocket);
 * </script>
 *
 * {#if sessionURL.value}
 *   <a href={sessionURL.value}>View session replay</a>
 * {/if}
 * ```
 */
export function createSessionURL(lr: LogRocket): { readonly value: string | null } {
  let url = $state<string | null>(null);

  lr.getSessionURL((sessionURL) => {
    url = sessionURL;
  });

  return {
    get value() {
      return url;
    }
  };
}
