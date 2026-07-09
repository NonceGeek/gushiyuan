import { preload } from "react-dom";
import { WENKAI_SUBSET_PATH } from "@/lib/wenkai-subset-path.generated";

export { WENKAI_SUBSET_PATH };

export function preloadWenkaiSubset(): void {
  preload(WENKAI_SUBSET_PATH, {
    as: "font",
    crossOrigin: "anonymous",
    type: "font/woff2",
  });
}
