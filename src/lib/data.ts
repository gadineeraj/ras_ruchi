import behanceRaw from "@/data/behance.json";
import tydRaw from "@/data/yellow-dwelling.json";
import { collectionMeta, type CollectionMeta } from "@/content/collections";
import { studies as studyMeta, textSplits, type StudyMeta } from "@/content/studies";

export type Img = {
  src: string;
  width: number;
  height: number;
  blur: string;
  color: string;
  animated?: boolean;
};

export type Colourway = {
  name: string;
  url: string;
  seenAs: string;
  swatchFrom: string;
  swatch: Img;
  scene: Img | null;
  chip: Img & { shade: string };
};

export type Design = {
  slug: string;
  name: string;
  technique: string;
  story: string;
  colourways: Colourway[];
};

export type Collection = CollectionMeta & {
  slug: string;
  name: string;
  season: string;
  designs: Design[];
};

export type StudyBlock =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "keywords"; items: string[] }
  | { type: "list"; lead: string; items: string[] }
  | { type: "images"; images: Img[] };

export type Study = StudyMeta & { coverImage: Img; behanceUrls: string[]; blocks: StudyBlock[] };

type RawBlock = { type: "image"; src: string; width: number; height: number; blur: string; color: string; animated?: boolean } | { type: "text"; text: string };
type RawProject = { slug: string; title: string; subtitle: string; behanceUrl: string; blocks: RawBlock[] };

// On GitHub Pages the site lives under a sub-path (e.g. /ras_ruchi), and plain
// <img> sources do not get it automatically, so image paths are prefixed here.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
function withBasePath<T>(raw: T): T {
  return BASE_PATH ? JSON.parse(JSON.stringify(raw).replaceAll('"/images/', `"${BASE_PATH}/images/`)) : raw;
}

// ------------------------------------------------------------- collections

const collections: Collection[] = (withBasePath(tydRaw) as Omit<Collection, keyof CollectionMeta>[]).map((c) => ({
  ...c,
  ...collectionMeta[c.slug],
}));
const collectionsBySlug = new Map(collections.map((c) => [c.slug, c]));

export function getCollections() {
  return collections;
}

export function getCollection(slug: string) {
  return collectionsBySlug.get(slug);
}

export function colourwayCount(c: Collection) {
  return c.designs.reduce((n, d) => n + d.colourways.length, 0);
}

/** The photo shown when a swatch is lifted: the room shot, else the full product photo. */
export function viewOf(cw: Colourway): Img {
  return cw.scene ?? cw.swatch;
}

// ------------------------------------------------------------------ studies

const projects = new Map((withBasePath(behanceRaw) as RawProject[]).map((p) => [p.slug, p]));

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const tidy = (s: string) =>
  s
    .replace(/​/g, "")
    .replace(/\.(?=[A-Z][a-z])/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

function textBlocks(raw: string, dropPrefix?: string): StudyBlock[] {
  let text = tidy(raw);
  if (dropPrefix && text.startsWith(dropPrefix)) text = text.slice(dropPrefix.length).replace(/^[-\s]+/, "");

  for (const [prefix, [heading]] of Object.entries(textSplits)) {
    if (text.startsWith(prefix)) {
      const rest = text.slice(prefix.length).trim();
      if (prefix.startsWith("Points collected")) {
        const [lead, ...items] = rest.split(/\d\.\s*/);
        return [{ type: "heading", text: heading }, { type: "list", lead: lead.trim(), items: items.map((i) => i.trim()) }];
      }
      return rest ? [{ type: "heading", text: heading }, { type: "para", text: rest }] : [{ type: "heading", text: heading }];
    }
  }

  const keywords = text.match(/^Keywords-\s*(.*)$/);
  if (keywords) return [{ type: "keywords", items: keywords[1].split("|").map((k) => k.trim()) }];

  // "Motif ExplorationFew of the motif…": a heading run straight into its paragraph.
  const joint = text.slice(0, 48).search(/[a-z][A-Z]/);
  if (joint > 0 && text.slice(0, joint + 1).split(" ").length <= 5) {
    return [
      { type: "heading", text: sentenceCase(text.slice(0, joint + 1)) },
      { type: "para", text: text.slice(joint + 1) },
    ];
  }

  if (text.length < 44 && !/[.:]$/.test(text)) return [{ type: "heading", text: sentenceCase(text) }];
  return [{ type: "para", text }];
}

function buildStudy(meta: StudyMeta): Study {
  const sources = meta.sources.map((s) => projects.get(s)!);
  const coverRaw = sources.find((p) => p.slug === meta.cover.source)!.blocks.filter((b) => b.type === "image")[meta.cover.index] as Extract<RawBlock, { type: "image" }>;
  const blocks: StudyBlock[] = [];
  const push = (b: StudyBlock) => {
    const last = blocks.at(-1);
    if (b.type === "images" && last?.type === "images") last.images.push(...b.images);
    else blocks.push(b);
  };

  for (const p of sources) {
    if (sources.length > 1) push({ type: "heading", text: p.title });
    for (const b of p.blocks) {
      if (b.type === "image") {
        if (b.src === coverRaw.src) continue;
        const { type: _type, ...img } = b;
        push({ type: "images", images: [img] });
      } else {
        textBlocks(b.text, sources.length > 1 ? p.title : undefined).forEach(push);
      }
    }
  }

  const { type: _t, ...coverImage } = coverRaw;
  return { ...meta, coverImage, behanceUrls: sources.map((p) => p.behanceUrl), blocks };
}

const studies = studyMeta.map(buildStudy);
const studiesBySlug = new Map(studies.map((s) => [s.slug, s]));

export function getStudies() {
  return studies;
}

export function getStudy(slug: string) {
  return studiesBySlug.get(slug);
}

/** A Behance image by project and position, for pages that quote a study's process. */
export function studyImage(source: string, index: number): Img {
  const img = projects.get(source)!.blocks.filter((b) => b.type === "image")[index] as Extract<RawBlock, { type: "image" }>;
  const { type: _t, ...rest } = img;
  return rest;
}

// --------------------------------------------------------------- home picks

type Pick = { collection: string; design: string; colourway: string };

const HERO_PICKS: Pick[] = [
  { collection: "rasaa", design: "Kinari", colourway: "Brick Red" },
  { collection: "ratna", design: "Kadamba", colourway: "Crimson Red" },
  { collection: "ratna", design: "Tara", colourway: "Indigo" },
  { collection: "entwine", design: "Glen", colourway: "Mist Blue" },
  { collection: "rasaa", design: "Mudra", colourway: "Teal" },
  { collection: "pause", design: "Sienna", colourway: "Geometric" },
  { collection: "entwine", design: "Elba", colourway: "Rust" },
  { collection: "rasaa", design: "Kolam", colourway: "Pepper Green" },
  { collection: "archive", design: "Eden", colourway: "Mustard" },
  { collection: "archive", design: "Pergola", colourway: "Indigo" },
];

export type SwatchItem = {
  id: string;
  design: string;
  colourway: string;
  collection: string;
  collectionSlug: string;
  season: string;
  /** Product type of the photo in the window, e.g. "Blind" or "Printed Fabric". */
  seenAs: string;
  chip: Colourway["chip"];
  view: Img;
  href: string;
};

export function toSwatchItem(c: Collection, d: Design, cw: Colourway): SwatchItem {
  return {
    id: `${c.slug}-${d.slug}-${cw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    design: d.name,
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

export function getHeroSwatches(): SwatchItem[] {
  return HERO_PICKS.map(({ collection, design, colourway }) => {
    const c = getCollection(collection)!;
    const d = c.designs.find((x) => x.name === design)!;
    const cw = d.colourways.find((x) => x.name === colourway)!;
    return toSwatchItem(c, d, cw);
  });
}

