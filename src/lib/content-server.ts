export { allBlocks, orderPages, pageIndex, studySummaries } from "./content-utils";

// Reads the site's content from content/*.json on the server. The Studio
// writes these files; the site reads them fresh on every request in
// development and once per page when building.
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Collection, Page, PageData, SiteMeta, SiteSettings } from "./content-types";
import { orderPages, pageIndex, studySummaries } from "./content-utils";
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
