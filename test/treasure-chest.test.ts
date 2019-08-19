import { createCache } from '../src/treasure-chest';

describe('Cache', () => {
  it('should store numbers', () => {
    const cache = createCache({
      computeKey(input: number): string {
        return `${input}`;
      },
      computeValue(input: number): number {
        return input * 10;
      },
    });

    expect(cache.get(1)).toEqual(10);

    cache.set('2', 12); // clearly wrong
    expect(cache.get(2)).toEqual(12); // garbage in, garbage out

    cache.set('3', 13); // clearly wrong
    expect(cache.get(3)).toEqual(13); // garbage in, garbage out

    cache.delete('2');
    expect(cache.get(2)).toEqual(20);

    cache.clear();
    expect(cache.get(3)).toEqual(30);
  });

  it('should store complex values', async () => {
    function getPromisedValue<T>(input: T): Promise<T> {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(input);
        }, 0);
      });
    }

    const cache = createCache({
      computeKey(input: number): string {
        return `${input}`;
      },
      computeValue(input: number): Promise<number> {
        return getPromisedValue(input * 10);
      },
    });

    expect(await cache.get(1)).toEqual(10);

    cache.set('2', Promise.resolve(12)); // clearly wrong
    expect(await cache.get(2)).toEqual(12); // garbage in, garbage out

    cache.set('3', Promise.resolve(13)); // clearly wrong
    expect(await cache.get(3)).toEqual(13); // garbage in, garbage out

    cache.delete('2');
    expect(await cache.get(2)).toEqual(20);

    cache.clear();
    expect(await cache.get(3)).toEqual(30);
  });
});
