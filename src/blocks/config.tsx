// The block library: every kind of block a page can hold, grouped the way the
// Studio's "Add" panel shows them, plus the settings every page carries.
// Shared by the published site (rendered on the server) and the Studio.
import type { Config } from "@puckeditor/core";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { PageRoot, SiteMeta } from "@/lib/content-types";
import { f } from "./fields";
import { layoutBlocks } from "./layout";
import { mediaBlocks } from "./media";
import { portfolioBlocks } from "./portfolio";
import { textBlocks } from "./text";

export const blocks = { ...textBlocks, ...mediaBlocks, ...layoutBlocks, ...portfolioBlocks };

export type BlockName = keyof typeof blocks;

export const categories: Record<string, { title: string; components: BlockName[] }> = {
  text: { title: "Words", components: ["Heading", "Text", "Tagline", "Quote", "Keywords", "Facts", "Button"] },
  media: { title: "Photos & video", components: ["Image", "Gallery", "StudyImages", "Video", "Swatches", "SwatchViewer", "ThenNow"] },
  layout: { title: "Layout", components: ["Section", "Columns", "Card", "FreeCanvas", "Spacer", "Divider"] },
  work: { title: "Her work", components: ["HomeHero", "CollectionCards", "ShadeBoard", "StudySheets", "ProcessSteps", "PracticeWay", "Quotes"] },
  pageParts: { title: "Page parts", components: ["PageTitle", "BackLink", "CollectionCard", "CollectionPager", "StudyHeader", "StudyFooter"] },
};

const rootFields = {
  title: f.text("Page name"),
  path: f.text("Web address", { placeholder: "/about" }),
  description: f.textarea("Search description", { placeholder: "One or two sentences shown by Google and when the link is shared" }),
  shareImage: f.photo("Share image", "Shown when the page is shared on WhatsApp, Instagram or email."),
  draft: f.toggle("Draft", "Drafts stay out of the published site until you switch this off."),
  kind: { type: "custom", label: "", render: () => null, metadata: { kind: "hidden" } },
  collection: f.collection("Collection this page shows"),
};

type RootProps = PageRoot & { children: ReactNode; puck: { metadata: SiteMeta; isEditing: boolean } };

export const root = {
  label: "Page",
  fields: rootFields,
  defaultProps: { title: "New page", path: "/new-page", kind: "page", description: "", draft: false, shareImage: null, collection: "" },
  render: ({ children, puck }: RootProps) => {
    // The Studio shows the shared header and footer around the page so it
    // looks as it will; on the site they come from the layout instead.
    if (!puck?.isEditing) return <>{children}</>;
    const site = puck.metadata.site;
    return (
      <>
        <SiteHeader site={site} />
        <main id="main">{children}</main>
        <div data-studio-global="footer">
          <SiteFooter site={site} />
        </div>
      </>
    );
  },
};

export const config = { components: blocks, categories, root } as unknown as Config;
