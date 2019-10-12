import { Optional } from '@iwburns/tupperware';

/**
 * ## Config
 *
 * Describes how the `Cache` object should behave.  Objects that match this interface can be used
 * to create new `Cache` objects.
 *
 * `computeKey` is a function that the `Cache` object will use to determine how to uniquely
 * identify each value in the cache based on the `Input` data provided.  This function is called
 * every time you attempt to get data out of the cache with the `get` function.
 *
 * `computeValue` is another function that the `Cache` object will use, but this one is used to
 * (you probably guessed it) compute the "value" behind each "key" in the cache.  This function
 * will be called if there is no value in the cache for the `Input` provided to the `get` function.
 */
export interface Config<Input, Output> {
  /**
   * Tells the `Cache` object how to compute a unique key for each input provided.
   *
   * This function **must** return a _unique_ string for whatever definition of _unique_ which
   * happens to be useful in your scenario.
   *
   * @param input The value to compute a unique key with.
   */
  computeKey: (input: Input) => string;

  /**
   * Tells the `Cache` object how to compute a value for each input provided.
   *
   * This function will only be called when the key for this input doesn't exist in the cache.
   *
   * @param input The value to compute the `Output` with.
   */
  computeValue: (input: Input) => Output;
}

/**
 * ## Cache
 *
 * This is the cache object itself.  It holds the data you care about and has several methods
 * for easily accessing that data.
 *
 * This object can be created directly, but the `createCache` function is also provided in cases
 * where that may be more ergonomic.
 */
export class Cache<Input, Output> {
  /**
   * @hidden
   */
  private data: Map<string, Output>;

  /**
   * @hidden
   */
  private config: Config<Input, Output>;

  /**
   * Creates a new cache object with the provided `config`.
   *
   * Values can then be retrieved from the cache and they will either be computed or retrieved from
   * the cache as needed.
   *
   * ```
   * const cache = new Cache({
   *   computeKey(input: number): string {
   *     return `${input}`;
   *   },
   *   computeValue(input: number): number {
   *     return input * 10;
   *   },
   * });
   *
   * const one = cache.get(1); // computed
   * const oneAgain = cache.get(1); // cached
   * // one === 10
   * // oneAgain === 10
   * ```
   *
   * @param config The `Config` object used to create the `Cache`.
   */
  constructor(config: Config<Input, Output>) {
    this.data = new Map();
    this.config = config;
  }

  /**
   * @hidden
   */
  private getCached(key: string): Optional<Output> {
    return Optional.fromNullable(this.data.get(key));
  }

  /**
   * @hidden
   */
  private getComputed(input: Input, key: string): Output {
    const value = this.config.computeValue(input);
    this.data.set(key, value);
    return value;
  }

  /**
   * Returns the `Output` value associated with the `Input` provided.
   *
   * This function may or may not have to compute the `Output` value depending on whether or not
   * the data already exists in the cache.
   *
   * ```
   * const cache = createCache({
   *   computeKey(input: number): string {
   *     return `${input}`;
   *   },
   *   computeValue(input: number): number {
   *     return input * 10;
   *   },
   * });
   *
   * const one = cache.get(1); // computed
   * const oneAgain = cache.get(1); // cached
   * // one === 10
   * // oneAgain === 10
   * ```
   *
   * @param input The input value to use when getting the value out of the cache.
   */
  get(input: Input): Output {
    const key = this.config.computeKey(input);
    return this.getCached(key).unwrapOr(() => {
      return this.getComputed(input, key);
    });
  }

  /**
   * Manually sets a value inside the cache without computing it.
   *
   * This can be dangerous!
   *
   * ```
   * const cache = createCache({
   *   computeKey(input: number): string {
   *     return `${input}`;
   *   },
   *   computeValue(input: number): number {
   *     return input * 10;
   *   },
   * });
   *
   * cache.set('1', 100);
   * const one = cache.get(1); // cached but importantly: incorrect
   * // one === 100
   * ```
   *
   * @param key The key in the cache where the new value will be set.
   * @param value The value that that the new key should point to.
   */
  set(key: string, value: Output): void {
    this.data.set(key, value);
  }

  /**
   * Removes a key and it's associated data from the cache.
   *
   * This forces the next access of that same key to be computed instead of cached.
   *
   * ```
   * const cache = createCache({
   *   computeKey(input: number): string {
   *     return `${input}`;
   *   },
   *   computeValue(input: number): number {
   *     return input * 10;
   *   },
   * });
   *
   * const one = cache.get(1); // computed
   * cache.delete('1');
   * const oneAgain = cache.get(1); // computed again
   * // one === 10
   * // oneAgain === 10
   * ```
   *
   * @param key The key to be deleted.
   */
  delete(key: string): void {
    this.data.delete(key);
  }

  /**
   * Removes all keys and their associated dat from the cache.
   *
   * This causes the next access of every existing key to be re-computed instead of being read from
   * the cache.
   *
   * ```
   * const cache = createCache({
   *   computeKey(input: number): string {
   *     return `${input}`;
   *   },
   *   computeValue(input: number): number {
   *     return input * 10;
   *   },
   * });
   *
   * const one = cache.get(1); // computed
   * cache.clear();
   * const oneAgain = cache.get(1); // computed again
   * // one === 10
   * // oneAgain === 10
   * ```
   */
  clear() {
    this.data = new Map();
  }
}

/**
 * A small wrapper around the `Cache`'s constructor.
 *
 * @param config The configuration object to use when constructing the `Cache` object.
 */
export function createCache<Input, Output>(config: Config<Input, Output>) {
  return new Cache(config);
}
