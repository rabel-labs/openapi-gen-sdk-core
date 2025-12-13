import { defaultSpecnovaGenConfig } from '@/config/default';
import { Resolved, SpecnovaConfig } from '@/config/type';

/**
 * Generic "defaults + overrides" deep merger that removes all undefined values
 */
export function mergeWithDefaults<T extends object>(
  defaults: Resolved<T>,
  overrides: Partial<T> | Resolved<T> | undefined,
): Resolved<T> {
  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

  const deepMerge = (def: unknown, over: unknown): unknown => {
    // If override is strictly undefined, fall back to default
    if (over === undefined) return def;

    // If both sides are plain objects, merge their keys recursively.
    if (isPlainObject(def) && isPlainObject(over)) {
      const result: Record<string, unknown> = {};
      for (const [k, dv] of Object.entries(def)) {
        const ov = (over as Record<string, unknown>)[k];
        result[k] = deepMerge(dv, ov);
      }
      return result;
    }

    // For all other cases (including arrays, primitives, null), use the override value.
    return over;
  };

  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => {
      const override = overrides?.[key as keyof T];
      return [key, deepMerge(value, override)];
    }),
  ) as Resolved<T>;
}

/**
 * Checks whether the given config contains any normalization operations.
 * @param config - config
 * @returns true if there are normalization operations, false otherwise
 */
export function hasNormalize(config: SpecnovaConfig): boolean {
  const { normalized } = mergeWithDefaults(defaultSpecnovaGenConfig, config);
  if (!normalized) return false;
  return Object.values(normalized).some(Boolean);
}
