"use client";

import Link from "next/link";
import { useAudioFilter } from "@/components/AudioFilterProvider";
import { VariantText } from "@/components/VariantText";
import { VolumesNav } from "@/components/VolumesNav";
import { useUiText } from "@/components/ScriptVariantProvider";
import type { VariantableText } from "@/lib/script-variant";

export type VolumeCatalogItem = {
  slug: string;
  name: VariantableText;
  poemCount: number;
  audioPoemCount: number;
};

export function VolumeCatalogList({
  volumes,
}: {
  volumes: VolumeCatalogItem[];
}) {
  const { audioOnly } = useAudioFilter();
  const organizing = useUiText("organizing");
  const items = audioOnly
    ? volumes.filter((volume) => volume.audioPoemCount > 0)
    : volumes;

  return (
    <VolumesNav>
      <ol className="catalog__list">
        {items.map((volume) => {
          const empty = audioOnly
            ? volume.audioPoemCount === 0
            : volume.poemCount === 0;

          return (
            <li key={volume.slug} className="catalog__item">
              {empty ? (
                <>
                  <span className="catalog__link catalog__link--disabled">
                    <VariantText text={volume.name} />
                  </span>
                  <span className="catalog__meta">{organizing}</span>
                </>
              ) : (
                <Link href={`/v/${volume.slug}`} className="catalog__link">
                  <VariantText text={volume.name} />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </VolumesNav>
  );
}
