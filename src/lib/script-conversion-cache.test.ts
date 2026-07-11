import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("toTraditional process-local cache", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("opencc-js");
    vi.restoreAllMocks();
  });

  it("converts repeated identical input once after module init", async () => {
    const convert = vi.fn((input: string) => `T:${input}`);
    vi.doMock("opencc-js", () => ({
      Converter: () => convert,
    }));

    const { toTraditional } = await import("@/lib/script-conversion");
    const afterInit = convert.mock.calls.length;

    expect(toTraditional("test")).toBe("T:test");
    expect(toTraditional("test")).toBe("T:test");
    expect(convert.mock.calls.length).toBe(afterInit + 1);

    expect(toTraditional("other")).toBe("T:other");
    expect(convert.mock.calls.length).toBe(afterInit + 2);
  });
});
