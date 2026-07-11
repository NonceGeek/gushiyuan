import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  computeInputFingerprint,
  isCacheHit,
  isForceGeneration,
  readCacheManifest,
  writeCacheManifest,
} from "./lib/generation-cache";

const tempRoots: string[] = [];

function makeTempRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "gushiyuan-cache-"));
  tempRoots.push(root);
  return root;
}

afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop()!;
    fs.rmSync(root, { recursive: true, force: true });
  }
  delete process.env.GENERATE_FORCE;
});

describe("computeInputFingerprint", () => {
  it("same bytes and paths produce the same hash", () => {
    const root = makeTempRoot();
    fs.writeFileSync(path.join(root, "a.txt"), "hello");
    fs.mkdirSync(path.join(root, "dir"));
    fs.writeFileSync(path.join(root, "dir", "b.txt"), "world");

    const first = computeInputFingerprint({
      root,
      files: ["a.txt"],
      directories: ["dir"],
      version: "1",
    });
    const second = computeInputFingerprint({
      root,
      files: ["a.txt"],
      directories: ["dir"],
      version: "1",
    });
    expect(first).toBe(second);
  });

  it("directory enumeration order does not matter", () => {
    const root = makeTempRoot();
    fs.mkdirSync(path.join(root, "dir"));
    fs.writeFileSync(path.join(root, "dir", "z.txt"), "z");
    fs.writeFileSync(path.join(root, "dir", "a.txt"), "a");
    fs.writeFileSync(path.join(root, "dir", "m.txt"), "m");

    const hashes = new Set<string>();
    for (let i = 0; i < 5; i++) {
      hashes.add(
        computeInputFingerprint({
          root,
          directories: ["dir"],
          version: "1",
        }),
      );
    }
    expect(hashes.size).toBe(1);
  });

  it("one-byte content change changes the hash", () => {
    const root = makeTempRoot();
    const file = path.join(root, "a.txt");
    fs.writeFileSync(file, "hello");
    const before = computeInputFingerprint({
      root,
      files: ["a.txt"],
      version: "1",
    });
    fs.writeFileSync(file, "hellp");
    const after = computeInputFingerprint({
      root,
      files: ["a.txt"],
      version: "1",
    });
    expect(after).not.toBe(before);
  });

  it("rename changes the hash", () => {
    const root = makeTempRoot();
    fs.writeFileSync(path.join(root, "a.txt"), "hello");
    const before = computeInputFingerprint({
      root,
      files: ["a.txt"],
      version: "1",
    });
    fs.renameSync(path.join(root, "a.txt"), path.join(root, "b.txt"));
    const after = computeInputFingerprint({
      root,
      files: ["b.txt"],
      version: "1",
    });
    expect(after).not.toBe(before);
  });

  it("version change changes the hash", () => {
    const root = makeTempRoot();
    fs.writeFileSync(path.join(root, "a.txt"), "hello");
    const v1 = computeInputFingerprint({
      root,
      files: ["a.txt"],
      version: "1",
    });
    const v2 = computeInputFingerprint({
      root,
      files: ["a.txt"],
      version: "2",
    });
    expect(v2).not.toBe(v1);
  });
});

describe("cache manifest helpers", () => {
  it("matching manifest plus existing outputs is a hit", () => {
    const root = makeTempRoot();
    const out = path.join(root, "out.bin");
    const manifestPath = path.join(root, "cache", "manifest.json");
    fs.writeFileSync(out, "payload");
    writeCacheManifest(manifestPath, {
      inputsHash: "abc",
      generatorVersion: "1",
    });

    expect(
      isCacheHit({
        manifestPath,
        inputsHash: "abc",
        generatorVersion: "1",
        outputs: [{ path: out, bytes: Buffer.byteLength("payload") }],
      }),
    ).toBe(true);
  });

  it("missing output, malformed manifest, wrong hash, or force flag is a miss", () => {
    const root = makeTempRoot();
    const out = path.join(root, "out.bin");
    const manifestPath = path.join(root, "manifest.json");
    fs.writeFileSync(out, "payload");
    writeCacheManifest(manifestPath, {
      inputsHash: "abc",
      generatorVersion: "1",
    });

    expect(
      isCacheHit({
        manifestPath,
        inputsHash: "abc",
        generatorVersion: "1",
        outputs: [{ path: path.join(root, "missing.bin") }],
      }),
    ).toBe(false);

    fs.writeFileSync(manifestPath, "{not-json");
    expect(
      isCacheHit({
        manifestPath,
        inputsHash: "abc",
        generatorVersion: "1",
        outputs: [{ path: out }],
      }),
    ).toBe(false);
    expect(readCacheManifest(manifestPath)).toBeNull();

    writeCacheManifest(manifestPath, {
      inputsHash: "abc",
      generatorVersion: "1",
    });
    expect(
      isCacheHit({
        manifestPath,
        inputsHash: "wrong",
        generatorVersion: "1",
        outputs: [{ path: out }],
      }),
    ).toBe(false);

    process.env.GENERATE_FORCE = "1";
    expect(
      isCacheHit({
        manifestPath,
        inputsHash: "abc",
        generatorVersion: "1",
        outputs: [{ path: out }],
      }),
    ).toBe(false);
    expect(isForceGeneration()).toBe(true);
  });

  it("manifest write creates parent directory and replaces complete JSON", () => {
    const root = makeTempRoot();
    const manifestPath = path.join(root, "nested", "cache", "m.json");
    writeCacheManifest(manifestPath, { ok: true });
    expect(fs.existsSync(manifestPath)).toBe(true);
    expect(readCacheManifest(manifestPath)).toEqual({ ok: true });

    writeCacheManifest(manifestPath, { ok: false, n: 2 });
    expect(readCacheManifest(manifestPath)).toEqual({ ok: false, n: 2 });
  });
});
