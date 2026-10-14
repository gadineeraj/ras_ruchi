import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost, Rozha_One } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/lib/site";
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

export const metadata: Metadata = {
  title: {
    default: `${site.name}: ${site.person}, textile designer`,
    template: `%s · ${site.name}`,
  },
  description:
    "The textile work of Shruchi Jaiswal: print, weave and embroidery from Indian craft traditions, and the home collections she designs as Design Lead at The Yellow Dwelling.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d6d6d1" },
    { media: "(prefers-color-scheme: dark)", color: "#121311" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rozha.variable} ${bodoni.variable} ${jost.variable}`}>
      <body>
        <a className="skip-link t-label" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
