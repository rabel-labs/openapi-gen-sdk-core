import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';

/**
 * Generic "defaults + overrides" merger that removes all undefined values
 */
export function mergeWithDefaults<T extends object>(
  defaults: Required<T>,
  overrides: Partial<T> | undefined,
): Required<T> {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => {
      const override = overrides?.[key as keyof T];
      return [key, override === undefined ? value : override];
    }),
  ) as Required<T>;
}

/**
 * Checks whether the given config contains any normalization operations.
 * @param config - config
 * @returns true if there are normalization operations, false otherwise
 */
export function hasNormalize(config: OpenapiGenConfig): boolean {
  const { normalized } = mergeWithDefaults(defaultOpenapiGenConfig, config);
  if (!normalized) return false;
  return Object.values(normalized).some(Boolean);
}
