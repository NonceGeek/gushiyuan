export type GlyphStage = "oracle" | "bronze" | "seal" | "regular";

export type GlyphStageData = {
  label: string;
  image: string;
};

export type Character = {
  char: string;
  meaning: string;
  source: string;
  stages: Partial<Record<GlyphStage, GlyphStageData>>;
};

export const GLYPH_STAGE_ORDER: GlyphStage[] = [
  "oracle",
  "bronze",
  "seal",
  "regular",
];

export const GLYPH_STAGE_LABELS: Record<GlyphStage, string> = {
  oracle: "甲骨文",
  bronze: "金文",
  seal: "小篆",
  regular: "楷书",
};
