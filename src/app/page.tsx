import Link from "next/link";
import { CatalogLayout } from "@/components/CatalogLayout";
import { getAllVolumes } from "@/lib/poems";

export default function HomePage() {
  const volumes = getAllVolumes();

  return (
    <CatalogLayout title="目录">
      <nav aria-label="朝代分卷">
        <ol className="catalog__list">
          {volumes.map((volume) => (
            <li key={volume.slug} className="catalog__item">
              <Link href={`/v/${volume.slug}`} className="catalog__link">
                {volume.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </CatalogLayout>
  );
}
