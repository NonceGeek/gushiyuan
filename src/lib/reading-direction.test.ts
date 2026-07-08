import { describe, expect, it, vi } from "vitest";
import {
  alignVerticalScrollToFirstColumn,
  DEFAULT_READING_DIRECTION,
  READING_DIRECTION_STORAGE_KEY,
  overlaySideForReadingDirection,
  parseReadingDirection,
  persistReadingDirection,
  readStoredReadingDirection,
  verticalReadingScrollLeft,
} from "./reading-direction";

describe("parseReadingDirection", () => {
  it("returns vertical only for the vertical token", () => {
    expect(parseReadingDirection("vertical")).toBe("vertical");
  });

  it("falls back to horizontal for missing or unknown values", () => {
    expect(parseReadingDirection(null)).toBe("horizontal");
    expect(parseReadingDirection("")).toBe("horizontal");
    expect(parseReadingDirection("landscape")).toBe("horizontal");
  });
});

describe("readStoredReadingDirection", () => {
  it("reads the persisted direction from storage", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue("vertical"),
    };

    expect(readStoredReadingDirection(storage)).toBe("vertical");
    expect(storage.getItem).toHaveBeenCalledWith(READING_DIRECTION_STORAGE_KEY);
  });

  it("returns the default when nothing is stored", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
    };

    expect(readStoredReadingDirection(storage)).toBe(DEFAULT_READING_DIRECTION);
  });
});

describe("persistReadingDirection", () => {
  it("writes the direction to storage", () => {
    const storage = {
      setItem: vi.fn(),
    };

    persistReadingDirection(storage, "vertical");

    expect(storage.setItem).toHaveBeenCalledWith(
      READING_DIRECTION_STORAGE_KEY,
      "vertical",
    );
  });
});

describe("overlaySideForReadingDirection", () => {
  it("opens popovers below in horizontal mode", () => {
    expect(overlaySideForReadingDirection("horizontal", "popover")).toBe(
      "bottom",
    );
  });

  it("opens tooltips above in horizontal mode", () => {
    expect(overlaySideForReadingDirection("horizontal", "tooltip")).toBe("top");
  });

  it("opens overlays to the left in vertical mode", () => {
    expect(overlaySideForReadingDirection("vertical", "popover")).toBe("left");
    expect(overlaySideForReadingDirection("vertical", "tooltip")).toBe("left");
  });
});

describe("verticalReadingScrollLeft", () => {
  it("returns zero when content fits the viewport", () => {
    expect(verticalReadingScrollLeft(320, 320)).toBe(0);
    expect(verticalReadingScrollLeft(280, 320)).toBe(0);
  });

  it("returns overflow when content is wider than the viewport", () => {
    expect(verticalReadingScrollLeft(800, 320)).toBe(480);
  });
});

describe("alignVerticalScrollToFirstColumn", () => {
  type FakeViewport = {
    scrollWidth: number;
    clientWidth: number;
    scrollLeft: number;
    scrollTo: ReturnType<typeof vi.fn>;
  };

  function makeViewport(
    scrollWidth: number,
    clientWidth: number,
  ): FakeViewport {
    const el: FakeViewport = {
      scrollWidth,
      clientWidth,
      scrollLeft: 0,
      scrollTo: vi.fn((opts: { left: number }) => {
        el.scrollLeft = opts.left;
      }),
    };
    return el;
  }

  it("scrolls to the positive origin when the browser supports it", () => {
    const viewport = makeViewport(800, 320);
    alignVerticalScrollToFirstColumn(
      viewport as unknown as HTMLElement,
      480,
    );
    expect(viewport.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 480 }),
    );
  });

  it("does not attempt negative fallback when target is zero", () => {
    const viewport = makeViewport(320, 320);
    alignVerticalScrollToFirstColumn(
      viewport as unknown as HTMLElement,
      0,
    );
    expect(viewport.scrollTo).toHaveBeenCalledTimes(1);
    expect(viewport.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 0 }),
    );
  });
});
