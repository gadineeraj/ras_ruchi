// Pure helpers over the collections library. Safe on the server, in the
// browser and inside the Studio.
import type { Collection, Colourway, Design, Img, SiteMeta } from "./content-types";

export type SwatchItem = {
  id: string;
  design: string;
  designSlug: string;
  colourway: string;
  collection: string;
  collectionSlug: string;
  season: string;
  /** Product type of the photo in the window, e.g. "Blind" or "Printed Fabric". */
  seenAs: string;
  chip: Img & { shade: string };
  view: Img;
  href: string;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

export function colourwayCount(c: Collection) {
  return c.designs.reduce((n, d) => n + d.colourways.length, 0);
}

/** The photo shown when a swatch is lifted: the room shot, else the full product photo. */
export function viewOf(cw: Colourway): Img {
  return cw.scene ?? cw.swatch;
}

export function toSwatchItem(c: Collection, d: Design, cw: Colourway): SwatchItem {
  return {
    id: `${c.slug}-${d.slug}-${cw.id}`,
    design: d.name,
    designSlug: d.slug,
    colourway: cw.name,
    collection: c.name,
    collectionSlug: c.slug,
    season: c.season,
    seenAs: cw.scene ? cw.seenAs : cw.swatchFrom,
    chip: cw.chip,
    view: viewOf(cw),
    href: cw.url,
  };
}

/** "rasaa/kinari/brick-red" → the colourway, with its design and collection. */
export function findPick(collections: Collection[], pick: string) {
  const [cs, ds, cws] = (pick ?? "").split("/");
  const c = collections.find((x) => x.slug === cs);
  const d = c?.designs.find((x) => x.slug === ds);
  const cw = cws ? d?.colourways.find((x) => x.id === cws) : d?.colourways[0];
  return c && d && cw ? { collection: c, design: d, colourway: cw } : null;
}

export function pickToSwatch(collections: Collection[], pick: string): SwatchItem | null {
  const hit = findPick(collections, pick);
  return hit ? toSwatchItem(hit.collection, hit.design, hit.colourway) : null;
}

export function picksToSwatches(collections: Collection[], picks: { pick: string }[] | undefined): SwatchItem[] {
  return (picks ?? []).map((p) => pickToSwatch(collections, p.pick)).filter((x): x is SwatchItem => x !== null);
}

/** "ratna/kadamba" → every colourway of that design. */
export function designSwatches(collections: Collection[], ref: string): SwatchItem[] {
  const [cs, ds] = (ref ?? "").split("/");
  const c = collections.find((x) => x.slug === cs);
  const d = c?.designs.find((x) => x.slug === ds);
  return c && d ? d.colourways.map((cw) => toSwatchItem(c, d, cw)) : [];
}

/** The collection a block should show: its own choice, else the page's. */
export function collectionFor(meta: SiteMeta, slug: string | undefined): Collection | undefined {
  const want = slug || meta.page.collection;
  return meta.collections.find((c) => c.slug === want) ?? meta.collections[0];
}

/** The path of a collection's page, if it has one. */
export function collectionPath(meta: SiteMeta, slug: string): string {
  const page = meta.pages.find((p) => p.kind === "collection" && p.path.endsWith(`/${slug}`));
  return page?.path ?? `/collections/${slug}`;
}
