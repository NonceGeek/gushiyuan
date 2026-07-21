"use client";

import Link from "next/link";
import { useAudioFilter } from "@/components/AudioFilterProvider";
import { VariantText } from "@/components/VariantText";
import { useUiText } from "@/components/ScriptVariantProvider";
import type { VariantableText } from "@/lib/script-variant";

export type PoemCatalogItem = {
  slug: string;
  title: VariantableText;
  hasAudio: boolean;
};

export function PoemCatalogList({
  authorName,
  poems,
}: {
  authorName: string;
  poems: PoemCatalogItem[];
}) {
  const { audioOnly } = useAudioFilter();
  const emptyAuthorAudio = useUiText("emptyAuthorAudio");
  const items = audioOnly ? poems.filter((poem) => poem.hasAudio) : poems;

  if (items.length === 0) {
    return <p className="catalog__empty">{emptyAuthorAudio}</p>;
  }

  return (
    <nav aria-label={`${authorName}诗作`}>
      <ol className="catalog__list">
        {items.map((poem) => (
          <li key={poem.slug} className="catalog__item">
            <Link href={`/p/${poem.slug}`} className="catalog__link">
              <VariantText text={poem.title} />
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
