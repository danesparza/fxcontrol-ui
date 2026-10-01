import { describe, expect, it } from "vitest";
import { parseDiscovery } from "./discovery";
describe("discovery response validation", () => {
  it("accepts an empty snapshot", () =>
    expect(parseDiscovery({ data: [] })).toEqual([]));
  it.each([
    null,
    {},
    { data: null },
    { data: [null] },
    { data: [{ id: 4 }] },
    {
      data: [
        {
          id: "1",
          name: "x",
          service: "fxaudio",
          host: "x",
          port: 70000,
          addresses: [],
          api: "v1",
          scheme: "http",
          path: "/",
        },
      ],
    },
  ])("rejects malformed response %j", (value) => {
    expect(() => parseDiscovery(value)).toThrow();
  });
});
