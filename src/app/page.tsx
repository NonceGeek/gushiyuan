import { CatalogLayout } from "@/components/CatalogLayout";
import { VolumeCatalogList } from "@/components/VolumeCatalogList";
import { getAllVolumes, getPoemsByVolume } from "@/lib/poems";
import { makeTextVariant } from "@/lib/script-conversion";

export default function HomePage() {
  const volumes = getAllVolumes().map((volume) => {
    const poems = getPoemsByVolume(volume.slug);
    return {
      slug: volume.slug,
      name: makeTextVariant(volume.name),
      poemCount: poems.length,
      audioPoemCount: poems.filter((poem) => poem.hasAudio).length,
    };
  });

  return (
    <CatalogLayout
      title={makeTextVariant("目录")}
      breadcrumbs={[
        { label: makeTextVariant("古诗源"), href: "/" },
        { label: makeTextVariant("目录") },
      ]}
    >
      <VolumeCatalogList volumes={volumes} />
      <footer className="catalog__footer">
        <a
          href="https://bodhi.wtf/token/0x23707de0f3f0A2406213Ac3Cec8f6366e5efe976"
          className="catalog__footer-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          bodhi for gu-shi-yuan
        </a>
      </footer>
    </CatalogLayout>
  );
}
