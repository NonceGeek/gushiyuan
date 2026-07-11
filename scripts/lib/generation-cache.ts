import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PATH_SEP = "\0";

export type CacheOutputCheck = {
  path: string;
  bytes?: number;
};

export type ComputeInputFingerprintOptions = {
  root: string;
  files?: readonly string[];
  directories?: readonly string[];
  /** When walking directories, only include files with these extensions (e.g. `.md`). */
  extensions?: readonly string[];
  version: string;
};

export type IsCacheHitOptions = {
  manifestPath: string;
  inputsHash: string;
  generatorVersion: string;
  outputs: readonly CacheOutputCheck[];
};

function toPosixRelative(root: string, absolutePath: string): string {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

function shouldIncludeFile(
  filePath: string,
  extensions: readonly string[] | undefined,
): boolean {
  if (!extensions || extensions.length === 0) {
    return true;
  }
  const lower = filePath.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext.toLowerCase()));
}

/** Recursively list regular files under `directory`, as absolute paths. */
export function listFilesRecursive(
  directory: string,
  extensions?: readonly string[],
): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results: string[] = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (!shouldIncludeFile(absolute, extensions)) {
        continue;
      }
      results.push(absolute);
    }
  }

  return results;
}

/**
 * Content-addressed fingerprint over explicit files and directory trees.
 * Hashes sorted POSIX relative paths and file bytes; ignores mtimes.
 */
export function computeInputFingerprint({
  root,
  files = [],
  directories = [],
  extensions,
  version,
}: ComputeInputFingerprintOptions): string {
  const absoluteFiles = new Set<string>();

  for (const file of files) {
    const absolute = path.isAbsolute(file) ? file : path.join(root, file);
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
      absoluteFiles.add(path.resolve(absolute));
    }
  }

  for (const directory of directories) {
    const absoluteDir = path.isAbsolute(directory)
      ? directory
      : path.join(root, directory);
    for (const file of listFilesRecursive(absoluteDir, extensions)) {
      absoluteFiles.add(path.resolve(file));
    }
  }

  const relativePaths = [...absoluteFiles]
    .map((absolute) => toPosixRelative(root, absolute))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const hash = createHash("sha256");
  for (const relative of relativePaths) {
    const absolute = path.join(root, ...relative.split("/"));
    hash.update(relative);
    hash.update(PATH_SEP);
    hash.update(fs.readFileSync(absolute));
    hash.update(PATH_SEP);
  }
  hash.update(version);
  return hash.digest("hex");
}

export function readCacheManifest(manifestPath: string): unknown | null {
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeCacheManifest(
  manifestPath: string,
  data: unknown,
): void {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  const tempPath = `${manifestPath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tempPath, manifestPath);
}

export function isForceGeneration(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.GENERATE_FORCE === "1";
}

export function isCacheHit({
  manifestPath,
  inputsHash,
  generatorVersion,
  outputs,
}: IsCacheHitOptions): boolean {
  if (isForceGeneration()) {
    return false;
  }

  const manifest = readCacheManifest(manifestPath);
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest)
  ) {
    return false;
  }

  const record = manifest as Record<string, unknown>;
  if (record.inputsHash !== inputsHash) {
    return false;
  }
  if (record.generatorVersion !== generatorVersion) {
    return false;
  }

  for (const output of outputs) {
    if (!fs.existsSync(output.path)) {
      return false;
    }
    if (output.bytes !== undefined) {
      try {
        if (fs.statSync(output.path).size !== output.bytes) {
          return false;
        }
      } catch {
        return false;
      }
    }
  }

  return true;
}
