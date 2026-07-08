import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogLayout } from "@/components/CatalogLayout";
import {
  getAllPoems,
  getAuthorsByVolume,
  getPoemsByAuthor,
  getVolumeBySlug,
} from "@/lib/poems";
import { createPageMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ volumeSlug: string; authorSlug: string }>;
};

export function generateStaticParams() {
  const params: { volumeSlug: string; authorSlug: string }[] = [];

  for (const poem of getAllPoems()) {
    const key = `${poem.volume}/${poem.authorSlug}`;
    if (!params.some((p) => `${p.volumeSlug}/${p.authorSlug}` === key)) {
      params.push({ volumeSlug: poem.volume, authorSlug: poem.authorSlug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { volumeSlug, authorSlug } = await params;
  const volume = getVolumeBySlug(volumeSlug);
  const author = getAuthorsByVolume(volumeSlug).find((a) => a.slug === authorSlug);
  if (!volume || !author) {
    return { title: "古诗源" };
  }
  return createPageMetadata({
    title: `${author.name} · ${volume.name} · 古诗源`,
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { volumeSlug, authorSlug } = await params;
  const volume = getVolumeBySlug(volumeSlug);
  const author = getAuthorsByVolume(volumeSlug).find((a) => a.slug === authorSlug);
  if (!volume || !author) {
    notFound();
  }

  const poems = getPoemsByAuthor(volumeSlug, authorSlug);

  return (
    <CatalogLayout title={author.name}>
      <p className="catalog__breadcrumb">
        <Link href={`/v/${volumeSlug}`} className="catalog__breadcrumb-link">
          {volume.name}
        </Link>
      </p>
      <nav aria-label={`${author.name}诗作`}>
        <ol className="catalog__list">
          {poems.map((poem) => (
            <li key={poem.slug} className="catalog__item">
              <Link href={`/p/${poem.slug}`} className="catalog__link">
                {poem.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </CatalogLayout>
  );
}
