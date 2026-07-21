"use client";

import Link from "next/link";
import { useAudioFilter } from "@/components/AudioFilterProvider";
import { VariantText } from "@/components/VariantText";
import { useUiText } from "@/components/ScriptVariantProvider";
import type { VariantableText } from "@/lib/script-variant";

export type AuthorCatalogItem = {
  slug: string;
  name: VariantableText;
  poemCount: number;
  audioPoemCount: number;
};

export function AuthorCatalogList({
  volumeSlug,
  volumeName,
  authors,
}: {
  volumeSlug: string;
  volumeName: string;
  authors: AuthorCatalogItem[];
}) {
  const { audioOnly } = useAudioFilter();
  const emptyVolume = useUiText("emptyVolume");
  const emptyVolumeAudio = useUiText("emptyVolumeAudio");
  const items = audioOnly
    ? authors.filter((author) => author.audioPoemCount > 0)
    : authors;

  if (items.length === 0) {
    return (
      <p className="catalog__empty">{audioOnly ? emptyVolumeAudio : emptyVolume}</p>
    );
  }

  return (
    <nav aria-label={`${volumeName}诗人`}>
      <ol className="catalog__list">
        {items.map((author) => {
          const poemCount = audioOnly ? author.audioPoemCount : author.poemCount;
          return (
            <li key={author.slug} className="catalog__item">
              <Link
                href={`/v/${volumeSlug}/${author.slug}`}
                className="catalog__link"
              >
                <VariantText text={author.name} />
              </Link>
              <span className="catalog__meta">{poemCount} 首</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
