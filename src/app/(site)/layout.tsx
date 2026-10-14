import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { readSite } from "@/lib/content-server";

// Every published page: the shared header, the page, and the contact card.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const site = await readSite();
  return (
    <>
      <a className="skip-link t-label" href="#main">
        Skip to content
      </a>
      <SiteHeader site={site} />
      <main id="main">{children}</main>
      <SiteFooter site={site} />
    </>
  );
}
