import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { collectSiteFontGlyphs } from "@/lib/font-glyphs";
import { WENKAI_SUBSET_PATH } from "@/lib/wenkai-subset-path.generated";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const VALIDATE_SCRIPT = path.join(ROOT, "scripts/validate-subset-cmap.py");

function pythonAvailable(): boolean {
  try {
    execFileSync("python3", ["-c", "import fontTools"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("font subset", () => {
  it.skipIf(!pythonAvailable())(
    "woff2 cmap covers collectSiteFontGlyphs()",
    () => {
      const fontPath = path.join(ROOT, "public", WENKAI_SUBSET_PATH);
      expect(fs.existsSync(fontPath), `missing subset font at ${fontPath}`).toBe(
        true,
      );

      const glyphs = collectSiteFontGlyphs();
      execFileSync("python3", [VALIDATE_SCRIPT, fontPath], {
        input: JSON.stringify(glyphs),
        stdio: ["pipe", "inherit", "inherit"],
      });
    },
  );
});
