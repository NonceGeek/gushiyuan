export type LineageRelation = "化用" | "脱胎" | "意象承接";

export type StreamRef = {
  id: string;
  text: string;
  author: string;
  work?: string;
  relation: LineageRelation;
  note: string;
  poemSlug?: string;
  lineIndex?: number;
};

export type LineageClue = {
  id: string;
  source: {
    poemSlug: string;
    lineIndex: number;
  };
  streams: StreamRef[];
};
