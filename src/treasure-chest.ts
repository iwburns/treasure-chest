import { Optional } from '@iwburns/tupperware';

export interface Config<Input, Output> {
  computeKey: (input: Input) => string;
  computeValue: (input: Input) => Output;
}

export interface KeyValuePair<Output> {
  key: string;
  value: Output;
}

export class Cache<Input, Output> {
  private data: Map<string, Output>;
  private config: Config<Input, Output>;

  /**
   * @hidden
   */
  constructor(config: Config<Input, Output>) {
    this.data = new Map();
    this.config = config;
  }

  private getCached(key: string): Optional<Output> {
    return Optional.fromNullable(this.data.get(key));
  }

  private getComputed(input: Input, key: string): Output {
    const value = this.config.computeValue(input);
    this.data.set(key, value);
    return value;
  }

  get(input: Input): Output {
    const key = this.config.computeKey(input);
    return this.getCached(key).unwrapOr(() => {
      return this.getComputed(input, key);
    });
  }

  set(key: string, value: Output): void {
    this.data.set(key, value);
  }

  delete(key: string) {
    this.data.delete(key);
  }

  clear() {
    this.data = new Map();
  }
}

export function createCache<Input, Output>(config: Config<Input, Output>) {
  return new Cache(config);
}
