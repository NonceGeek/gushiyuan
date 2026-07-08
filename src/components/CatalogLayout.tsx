import Link from "next/link";

type CatalogLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function CatalogLayout({ title, children }: CatalogLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col px-8 py-16 md:px-12 md:py-24">
      <header className="mb-16 text-center md:mb-20">
        <Link href="/" className="catalog__site-title">
          古诗源
        </Link>
        <h1 className="catalog__title">{title}</h1>
      </header>
      <main className="mx-auto w-full max-w-md">{children}</main>
    </div>
  );
}
