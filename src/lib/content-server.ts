// Reads the site's content from content/*.json on the server. The Studio
// writes these files; the site reads them fresh on every request in
// development and once per page when building.
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Collection, Page, PageData, SiteMeta, SiteSettings, StudySummary } from "./content-types";
import { normalisePath } from "./paths";

export const CONTENT_DIR = path.join(process.cwd(), "content");

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(CONTENT_DIR, file), "utf8")) as T;
}

export const readSite = cache(() => readJson<SiteSettings>("site.json"));

export const readCollections = cache(() => readJson<Collection[]>("collections.json"));

export const readPages = cache(async (): Promise<Page[]> => {
  const dir = path.join(CONTENT_DIR, "pages");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  const pages = await Promise.all(files.map(async (f) => ({ id: f.replace(/\.json$/, ""), data: await readJson<PageData>(`pages/${f}`) })));
  const site = await readSite();
  return orderPages(pages, site.pageOrder ?? []);
});

/** Pages in the order set in the Studio's Pages panel; unlisted ones after. */
export function orderPages(pages: Page[], order: string[]): Page[] {
  const at = new Map(order.map((id, i) => [id, i]));
  return [...pages].sort((a, b) => (at.get(a.id) ?? 1e6) - (at.get(b.id) ?? 1e6) || a.id.localeCompare(b.id));
}

type Node = { type: string; props: Record<string, unknown> };

/** Every block on a page, nested ones included. */
export function allBlocks(data: PageData): Node[] {
  const out: Node[] = [];
  const visit = (items: unknown) => {
    if (!Array.isArray(items)) return;
    for (const item of items as Node[]) {
      if (!item || typeof item !== "object" || !("type" in item)) continue;
      out.push(item);
      for (const value of Object.values(item.props ?? {})) {
        if (Array.isArray(value) && value.some((v) => v && typeof v === "object" && "type" in v && "props" in v)) visit(value);
      }
    }
  };
  visit(data.content);
  return out;
}

/** What the studies index shows, read from each study page's header block. */
export function studySummaries(pages: Page[], includeDrafts = false): StudySummary[] {
  return pages
    .filter((p) => p.data.root.props.kind === "study" && (includeDrafts || !p.data.root.props.draft))
    .map((p) => {
      const header = allBlocks(p.data).find((b) => b.type === "StudyHeader")?.props ?? {};
      return {
        id: p.id,
        path: normalisePath(p.data.root.props.path),
        title: typeof header.title === "string" ? header.title : p.data.root.props.title,
        hook: typeof header.hook === "string" ? header.hook : "",
        credits: (header.credits as StudySummary["credits"]) ?? [],
        cover: (header.cover as StudySummary["cover"]) ?? null,
      };
    });
}

export function pageIndex(pages: Page[]): SiteMeta["pages"] {
  return pages.map((p) => ({ id: p.id, title: p.data.root.props.title, path: normalisePath(p.data.root.props.path), kind: p.data.root.props.kind, draft: p.data.root.props.draft }));
}

export async function loadAll() {
  const [site, collections, pages] = await Promise.all([readSite(), readCollections(), readPages()]);
  return { site, collections, pages };
}

/** The published pages: drafts are left out. */
export async function publishedPages() {
  return (await readPages()).filter((p) => !p.data.root.props.draft);
}

export async function findPage(pathname: string) {
  const want = normalisePath(pathname);
  return (await publishedPages()).find((p) => normalisePath(p.data.root.props.path) === want);
}

export async function metaFor(page: Page): Promise<SiteMeta> {
  const { site, collections, pages } = await loadAll();
  const live = pages.filter((p) => !p.data.root.props.draft);
  return {
    site,
    collections,
    studies: studySummaries(live),
    pages: pageIndex(live),
    page: { id: page.id, path: normalisePath(page.data.root.props.path), kind: page.data.root.props.kind, collection: page.data.root.props.collection },
  };
}
