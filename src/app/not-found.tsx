import { Render } from "@puckeditor/core/rsc";
import { config } from "@/blocks/config";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metaFor, readPages, readSite } from "@/lib/content-server";
import { preparePage } from "@/lib/render-data";

// The "Page not found" page is an ordinary page she can edit in the Studio.
export default async function NotFound() {
  const [site, pages] = await Promise.all([readSite(), readPages()]);
  const page = pages.find((p) => p.id === "not-found");
  return (
    <>
      <SiteHeader site={site} />
      <main id="main">
        {page ? (
          <Render config={config} data={preparePage(page.data, config)} metadata={(await metaFor(page)) as unknown as Record<string, unknown>} />
        ) : (
          <div className="wrap" style={{ paddingBlock: 96 }}>
            <h1 className="t-display">Page not found</h1>
          </div>
        )}
      </main>
      <SiteFooter site={site} />
    </>
  );
}
