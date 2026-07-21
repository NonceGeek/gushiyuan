import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorCatalogList } from "@/components/AuthorCatalogList";
import { CatalogLayout } from "@/components/CatalogLayout";
import {
  getAllVolumes,
  getAuthorsByVolume,
  getPoemsByAuthor,
  getVolumeBySlug,
} from "@/lib/poems";
import { makeTextVariant } from "@/lib/script-conversion";
import { createPageMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ volumeSlug: string }>;
};

export function generateStaticParams() {
  return getAllVolumes().map((volume) => ({ volumeSlug: volume.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { volumeSlug } = await params;
  const volume = getVolumeBySlug(volumeSlug);
  if (!volume) {
    return { title: "古诗源" };
  }
  return createPageMetadata({ title: `${volume.name} · 古诗源` });
}

export default async function VolumePage({ params }: PageProps) {
  const { volumeSlug } = await params;
  const volume = getVolumeBySlug(volumeSlug);
  if (!volume) {
    notFound();
  }

  const authors = getAuthorsByVolume(volumeSlug).map((author) => {
    const poems = getPoemsByAuthor(volumeSlug, author.slug);
    return {
      slug: author.slug,
      name: makeTextVariant(author.name),
      poemCount: poems.length,
      audioPoemCount: poems.filter((poem) => poem.hasAudio).length,
    };
  });

  return (
    <CatalogLayout
      title={makeTextVariant(volume.name)}
      breadcrumbs={[
        { label: makeTextVariant("古诗源"), href: "/" },
        { label: makeTextVariant(volume.name) },
      ]}
    >
      <AuthorCatalogList
        volumeSlug={volumeSlug}
        volumeName={volume.name}
        authors={authors}
      />
    </CatalogLayout>
  );
}
