import type { Metadata } from "next";
import { SiteSearch } from "@/components/SiteSearch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildSearchIndex } from "@/lib/search-index";
import {
  createPageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-metadata";
import "./globals.css";

export const metadata: Metadata = createPageMetadata({
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = buildSearchIndex();

  return (
    <html lang="zh-CN">
      <body>
        <SiteSearch index={searchIndex} />
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
