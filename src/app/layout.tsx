import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost, Rozha_One } from "next/font/google";
import { readSite } from "@/lib/content-server";
import "./globals.css";

// Taglines and quotes: Bodoni Moda italic, a high-contrast Didone italic. Only
// the italic is loaded; its optical-size axis keeps it fine at large sizes.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["italic"],
  display: "swap",
});

// Reading text and printed labels: Jost, a Futura-style geometric sans in the
// family of the Avenir and Century Gothic used by The Yellow Dwelling and Sura.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

// Display, in both scripts: Rozha One, a high-contrast fat face drawn for
// Devanagari and Latin together, so "ras.ruchi" and रसरुचि are one typeface.
// It has a single weight and no italic.
const rozha = Rozha_One({
  variable: "--font-rozha",
  weight: "400",
  subsets: ["latin", "devanagari"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await readSite();
  return {
    title: {
      default: `${site.name}: ${site.person}, ${site.role.toLowerCase()}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d6d6d1" },
    { media: "(prefers-color-scheme: dark)", color: "#121311" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rozha.variable} ${bodoni.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
