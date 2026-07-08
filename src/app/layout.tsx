import type { Metadata } from "next";
import { SiteSearch } from "@/components/SiteSearch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildSearchIndex } from "@/lib/search-index";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gsy.aiwayfarer.net"),
  title: "古诗源",
  description: "回到原点的古诗阅读",
};

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
