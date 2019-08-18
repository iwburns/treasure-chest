import { createCache } from "../src/treasure-chest"

describe("Basic Test", () => {
  it("Should multiply numbers", () => {

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
    expect(cache.get(2)).toEqual(12);

    cache.setMany([
      { key: '5', value: 50 },
      { key: '6', value: 60 },
      { key: '7', value: 70 },
    ]);
    expect(cache.get(5)).toEqual(50);
    expect(cache.get(6)).toEqual(60);
    expect(cache.get(7)).toEqual(70);
  });
});
