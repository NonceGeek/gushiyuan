import { Converter } from "opencc-js";
import overrides from "../../content/script-conversion-overrides.json";
import type { LineageByLine } from "@/lib/lineage";
import type { LineageClue, StreamRef } from "@/lib/lineage-types";
import type { Poem, PoemMeta } from "@/lib/poems";
import type { TextVariant } from "@/lib/script-variant";
import {
  SITE_UI_TEXT_SIMPLIFIED,
  type SiteUiText,
} from "@/lib/site-ui-text";

type ConversionOverride = {
  source: string;
  traditional: string;
  note?: string;
};

export type PoemMetaWithTraditional = PoemMeta & {
  titleTraditional: string;
  authorTraditional: string;
  dynastyTraditional: string;
};

export type PoemWithTraditional = Poem & PoemMetaWithTraditional & {
  bodyTraditional: string;
};

export type StreamRefWithTraditional = StreamRef & {
  textTraditional: string;
  authorTraditional: string;
  workTraditional?: string;
  relationTraditional: string;
  sourceTraditional: string;
};

export type LineageClueWithTraditional = Omit<LineageClue, "streams"> & {
  streams: StreamRefWithTraditional[];
};

export type LineageByLineWithTraditional = Map<number, LineageClueWithTraditional>;

const convertSimplifiedToTraditional = Converter({ from: "cn", to: "t" });

const sortedOverrides = [...(overrides as ConversionOverride[])]
  .sort((a, b) => b.source.length - a.source.length)
  .map((override) => ({
    ...override,
    convertedSource: convertSimplifiedToTraditional(override.source),
  }));

function convertToTraditionalUncached(input: string): string {
  let converted = convertSimplifiedToTraditional(input);

  for (const override of sortedOverrides) {
    converted = converted.split(override.convertedSource).join(override.traditional);
  }

  return converted;
}

/** Process-local memo only; not shared across npm generator processes. */
const traditionalByInput = new Map<string, string>();

export function toTraditional(input: string): string {
  const cached = traditionalByInput.get(input);
  if (cached !== undefined) {
    return cached;
  }
  const converted = convertToTraditionalUncached(input);
  traditionalByInput.set(input, converted);
  return converted;
}

export function makeTextVariant(simplified: string): TextVariant {
  return {
    simplified,
    traditional: toTraditional(simplified),
  };
}

export function withTraditionalPoemMeta(
  poem: PoemMeta,
): PoemMetaWithTraditional {
  return {
    ...poem,
    titleTraditional: toTraditional(poem.title),
    authorTraditional: toTraditional(poem.author),
    dynastyTraditional: toTraditional(poem.dynasty),
  };
}

export function withTraditionalPoem(poem: Poem): PoemWithTraditional {
  return {
    ...withTraditionalPoemMeta(poem),
    body: poem.body,
    bodyTraditional: toTraditional(poem.body),
  };
}

export function withTraditionalLineage(
  lineageByLine: LineageByLine,
): LineageByLineWithTraditional {
  const result: LineageByLineWithTraditional = new Map();

  for (const [lineIndex, clue] of lineageByLine) {
    result.set(lineIndex, {
      ...clue,
      streams: clue.streams.map((stream) => ({
        ...stream,
        textTraditional: toTraditional(stream.text),
        authorTraditional: toTraditional(stream.author),
        workTraditional: stream.work ? toTraditional(stream.work) : undefined,
        relationTraditional: toTraditional(stream.relation),
        sourceTraditional: toTraditional(stream.source),
      })),
    });
  }

  return result;
}

export function buildSiteUiText(): SiteUiText {
  return Object.fromEntries(
    Object.entries(SITE_UI_TEXT_SIMPLIFIED).map(([key, value]) => [
      key,
      makeTextVariant(value),
    ]),
  ) as SiteUiText;
}
