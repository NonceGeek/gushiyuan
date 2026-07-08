import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
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
      <head>
        <link
          rel="preload"
          href="/fonts/wenkai/wenkai-subset.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteChrome searchIndex={searchIndex} />
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
