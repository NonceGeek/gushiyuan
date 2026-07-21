import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSearchIndex } from "../src/lib/search-index";
import { getAudioPoemSlugs } from "../src/lib/poems";
import {
  computeInputFingerprint,
  isCacheHit,
  readCacheManifest,
  writeCacheManifest,
} from "./lib/generation-cache";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEARCH_OUTPUT_PATH = path.join(ROOT, "public/search-index.json");
const SLUGS_OUTPUT_PATH = path.join(ROOT, "public/poem-slugs.json");
const AUDIO_SLUGS_OUTPUT_PATH = path.join(ROOT, "public/audio-poem-slugs.json");
const MANIFEST_OUT = path.join(ROOT, "scripts/.cache/search-index.manifest.json");
const GENERATOR_VERSION = "2";
const MAX_POEM_SLUGS_BYTES = 65536;

type SearchCacheManifest = {
  inputsHash: string;
  generatorVersion: string;
  poemCount: number;
  authorCount: number;
  searchBytes: number;
  slugBytes: number;
  audioSlugBytes: number;
  audioSlugCount: number;
};

function computeSearchInputsHash(): string {
  return computeInputFingerprint({
    root: ROOT,
    files: [
      "src/lib/search-index.ts",
      "src/lib/poems.ts",
      "src/lib/script-conversion.ts",
      "content/script-conversion-overrides.json",
      "scripts/generate-search-index.ts",
      "package-lock.json",
    ],
    directories: ["content/poems"],
    extensions: [".md"],
    version: GENERATOR_VERSION,
  });
}

function slugArtifactIsValid(
  searchIndex: { poems: { slug: string }[] },
  slugs: unknown,
  slugBytes: number,
): boolean {
  if (!Array.isArray(slugs) || slugs.some((slug) => typeof slug !== "string")) {
    return false;
  }
  if (slugBytes > MAX_POEM_SLUGS_BYTES) {
    return false;
  }
  if (new Set(slugs as string[]).size !== slugs.length) {
    return false;
  }
  const expected = searchIndex.poems.map((poem) => poem.slug);
  if (slugs.length !== expected.length) {
    return false;
  }
  for (let i = 0; i < expected.length; i++) {
    if (slugs[i] !== expected[i]) {
      return false;
    }
  }
  return true;
}

function trySearchCacheHit(inputsHash: string): boolean {
  const manifest = readCacheManifest(MANIFEST_OUT);
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest)
  ) {
    return false;
  }

  const record = manifest as Partial<SearchCacheManifest>;
  if (
    typeof record.poemCount !== "number" ||
    typeof record.authorCount !== "number" ||
    typeof record.searchBytes !== "number" ||
    typeof record.slugBytes !== "number" ||
    typeof record.audioSlugBytes !== "number" ||
    typeof record.audioSlugCount !== "number"
  ) {
    return false;
  }

  if (
    !isCacheHit({
      manifestPath: MANIFEST_OUT,
      inputsHash,
      generatorVersion: GENERATOR_VERSION,
      outputs: [
        { path: SEARCH_OUTPUT_PATH, bytes: record.searchBytes },
        { path: SLUGS_OUTPUT_PATH, bytes: record.slugBytes },
        { path: AUDIO_SLUGS_OUTPUT_PATH, bytes: record.audioSlugBytes },
      ],
    })
  ) {
    return false;
  }

  try {
    const searchIndex = JSON.parse(
      fs.readFileSync(SEARCH_OUTPUT_PATH, "utf8"),
    ) as {
      poems: { slug: string }[];
      authors: unknown[];
    };
    const slugs = JSON.parse(fs.readFileSync(SLUGS_OUTPUT_PATH, "utf8")) as unknown;
    const audioSlugs = JSON.parse(
      fs.readFileSync(AUDIO_SLUGS_OUTPUT_PATH, "utf8"),
    ) as unknown;
    if (
      !Array.isArray(searchIndex.poems) ||
      !Array.isArray(searchIndex.authors) ||
      searchIndex.poems.length !== record.poemCount ||
      searchIndex.authors.length !== record.authorCount ||
      !Array.isArray(audioSlugs) ||
      audioSlugs.length !== record.audioSlugCount ||
      audioSlugs.some((slug) => typeof slug !== "string")
    ) {
      return false;
    }
    return slugArtifactIsValid(searchIndex, slugs, record.slugBytes);
  } catch {
    return false;
  }
}

const inputsHash = computeSearchInputsHash();
if (trySearchCacheHit(inputsHash)) {
  console.log("Skipping search index generation (cache hit)");
} else {
  const index = buildSearchIndex();
  const slugs = index.poems.map((poem) => poem.slug);
  const audioSlugs = getAudioPoemSlugs();

  fs.writeFileSync(SEARCH_OUTPUT_PATH, JSON.stringify(index));
  fs.writeFileSync(SLUGS_OUTPUT_PATH, JSON.stringify(slugs));
  fs.writeFileSync(AUDIO_SLUGS_OUTPUT_PATH, JSON.stringify(audioSlugs));

  const searchBytes = fs.statSync(SEARCH_OUTPUT_PATH).size;
  const slugBytes = fs.statSync(SLUGS_OUTPUT_PATH).size;
  const audioSlugBytes = fs.statSync(AUDIO_SLUGS_OUTPUT_PATH).size;

  writeCacheManifest(MANIFEST_OUT, {
    inputsHash,
    generatorVersion: GENERATOR_VERSION,
    poemCount: index.poems.length,
    authorCount: index.authors.length,
    searchBytes,
    slugBytes,
    audioSlugBytes,
    audioSlugCount: audioSlugs.length,
  } satisfies SearchCacheManifest);

  console.log(
    `Generated search-index.json: ${(searchBytes / 1024).toFixed(1)} KiB (${index.poems.length} poems, ${index.authors.length} authors)`,
  );
  console.log(
    `Generated poem-slugs.json: ${(slugBytes / 1024).toFixed(1)} KiB (${slugs.length} slugs)`,
  );
  console.log(
    `Generated audio-poem-slugs.json: ${(audioSlugBytes / 1024).toFixed(1)} KiB (${audioSlugs.length} slugs)`,
  );
}
