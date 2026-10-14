// Everything the Studio edits, read fresh from content/.
import fs from "node:fs/promises";
import path from "node:path";
import type { Collection, MediaItem, PageData, SiteSettings } from "@/lib/content-types";
import { CONTENT, readJson } from "./files";

export async function readAllContent() {
  const [site, collections, media] = await Promise.all([
    readJson<SiteSettings>(path.join(CONTENT, "site.json")),
    readJson<Collection[]>(path.join(CONTENT, "collections.json")),
    readJson<MediaItem[]>(path.join(CONTENT, "media.json")),
  ]);
  const files = (await fs.readdir(path.join(CONTENT, "pages"))).filter((f) => f.endsWith(".json"));
  const pages: Record<string, PageData> = {};
  for (const f of files) pages[f.replace(/\.json$/, "")] = await readJson<PageData>(path.join(CONTENT, "pages", f));
  return { site, collections, media, pages };
}
