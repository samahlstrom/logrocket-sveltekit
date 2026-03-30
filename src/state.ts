import type LogRocketType from 'logrocket';

type LogRocket = typeof LogRocketType;

export interface TrackStateOptions<T extends Record<string, unknown>> {
  /** Name shown in LogRocket logs, e.g. "chatState" */
  name: string;
  /** The Svelte 5 `$state` object to observe */
  state: T;
  /**
   * Pick which keys to track. Defaults to all enumerable keys.
   * Use this to avoid logging large or sensitive data.
   */
  keys?: (keyof T)[];
  /**
   * Sanitize values before sending to LogRocket.
   * Return the sanitized snapshot — omit keys you want redacted.
   */
  sanitize?: (snapshot: Partial<T>) => Record<string, unknown>;
}

/**
 * Tracks a Svelte 5 `$state` object in LogRocket.
 *
 * Must be called inside a reactive context (`$effect.root()` for module-level
 * state, or `$effect()` inside a component).
 *
 * Returns a function you should call inside `$effect()` — it reads the
 * reactive properties and logs the snapshot to LogRocket.
 *
 * Usage in a `.svelte.ts` state file:
 * ```ts
 * import LogRocket from 'logrocket';
 * import { trackState } from 'logrocket-sveltekit';
 *
 * const myState = $state({ count: 0, items: [] });
 *
 * const track = trackState(LogRocket, {
 *   name: 'myState',
 *   state: myState,
 *   keys: ['count', 'items']
 * });
 *
 * $effect.root(() => {
 *   $effect(() => track());
 * });
 * ```
 */
export function trackState<T extends Record<string, unknown>>(
  lr: LogRocket,
  options: TrackStateOptions<T>
): () => void {
  const { name, state, keys, sanitize } = options;

  return () => {
    const trackedKeys = keys ?? (Object.keys(state) as (keyof T)[]);

    const snapshot: Partial<T> = {};
    for (const key of trackedKeys) {
      // Reading each key inside $effect() subscribes to it reactively
      const val = state[key];
      snapshot[key] = val;
    }

    // Serialize for logging: arrays become their length, objects become key count
    const serialized: Record<string, unknown> = {};
    const source = sanitize ? sanitize(snapshot) : snapshot;

    for (const [k, v] of Object.entries(source)) {
      if (Array.isArray(v)) {
        serialized[k] = v.length;
      } else if (v && typeof v === 'object') {
        serialized[k] = `{${Object.keys(v).length} keys}`;
      } else {
        serialized[k] = v;
      }
    }

    lr.log(`[state] ${name}`, serialized);
  };
}
