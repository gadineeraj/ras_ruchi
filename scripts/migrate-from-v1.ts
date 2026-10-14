// One-time move of the v1 site into editable content files (content/*.json).
// Every page v1 built in code becomes a page of blocks the Studio can edit,
// with the same words, photos and order. Run with: node scripts/migrate-from-v1.ts
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectionMeta } from "./v1-data/collections.ts";
import { studies as studyMeta, textSplits } from "./v1-data/studies.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content");
const read = async (rel: string) => JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));

const tyd = await read("scripts/v1-data/yellow-dwelling.json");
const behance = await read("scripts/v1-data/behance.json");

const id = (type: string) => `${type}-${randomUUID()}`;
const block = (type: string, props: Record<string, unknown>) => ({ type, props: { id: id(type), ...props } });
const L = (width: string, space: string, extra: Record<string, unknown> = {}) => ({ width, space, show: "all", motion: "none", ...extra });

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");

// ------------------------------------------------------------- collections

type Img = { src: string; width: number; height: number; blur: string; color: string; animated?: boolean };

const collections = tyd.map((c: any) => ({
  slug: c.slug,
  name: c.name,
  season: c.season,
  band: collectionMeta[c.slug].band,
  line: collectionMeta[c.slug].line ?? "",
  intro: collectionMeta[c.slug].intro,
  designs: c.designs.map((d: any) => {
    const used = new Set<string>();
    return {
      slug: d.slug,
      name: d.name,
      technique: d.technique,
      story: d.story,
      colourways: d.colourways.map((cw: any) => {
        let cid = slugify(cw.name) || "colourway";
        while (used.has(cid)) cid += "-2";
        used.add(cid);
        return { id: cid, name: cw.name, url: cw.url, seenAs: cw.seenAs, swatchFrom: cw.swatchFrom, swatch: cw.swatch, scene: cw.scene, chip: cw.chip };
      }),
    };
  }),
}));

const pick = (collection: string, design: string, colourway: string) => {
  const c = collections.find((x: any) => x.slug === collection)!;
  const d = c.designs.find((x: any) => x.name === design)!;
  const cw = d.colourways.find((x: any) => x.name === colourway)!;
  return `${c.slug}/${d.slug}/${cw.id}`;
};

// ------------------------------------------------------------------- media

const media: any[] = [];
const seen = new Set<string>();
const added = new Date().toISOString().slice(0, 10);
const addMedia = (img: Img, folder: string, alt = "") => {
  if (!img?.src || seen.has(img.src)) return;
  seen.add(img.src);
  media.push({ ...img, name: path.basename(img.src).replace(/-[0-9a-f]{8}\.webp$/, "").replace(/\.webp$/, ""), alt, folder, added });
};
for (const c of collections) {
  for (const d of c.designs) {
    for (const cw of d.colourways) {
      const alt = `${d.name} in ${cw.name}`;
      addMedia(cw.scene, `Collections/${c.name}`, alt);
      addMedia(cw.swatch, `Collections/${c.name}`, alt);
      addMedia(cw.chip, `Collections/${c.name}`, `${alt}, swatch`);
    }
  }
}
for (const p of behance) {
  for (const b of p.blocks) if (b.type === "image") addMedia(b, `Studies/${p.title}`);
}

// ----------------------------------------------------------------- studies

const projects = new Map(behance.map((p: any) => [p.slug, p]));
const photo = (raw: any, alt = "") => {
  const { type: _t, ...img } = raw;
  return alt ? { ...img, alt } : img;
};
const studyImage = (source: string, index: number, alt = "") => photo((projects.get(source) as any).blocks.filter((b: any) => b.type === "image")[index], alt);

type StudyBlock = { type: "heading"; text: string } | { type: "para"; text: string } | { type: "keywords"; items: string[] } | { type: "list"; lead: string; items: string[] } | { type: "images"; images: any[] };

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const tidy = (s: string) => s.replace(/​/g, "").replace(/\.(?=[A-Z][a-z])/g, ". ").replace(/\s+/g, " ").trim();

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

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function studyPage(meta: any) {
  const sources = meta.sources.map((s: string) => projects.get(s) as any);
  const coverRaw = sources.find((p: any) => p.slug === meta.cover.source).blocks.filter((b: any) => b.type === "image")[meta.cover.index];
  const body: StudyBlock[] = [];
  const push = (b: StudyBlock) => {
    const last = body.at(-1);
    if (b.type === "images" && last?.type === "images") last.images.push(...b.images);
    else body.push(b);
  };
  for (const p of sources) {
    if (sources.length > 1) push({ type: "heading", text: p.title });
    for (const b of p.blocks) {
      if (b.type === "image") {
        if (b.src === coverRaw.src) continue;
        push({ type: "images", images: [photo(b)] });
      } else {
        textBlocks(b.text, sources.length > 1 ? p.title : undefined).forEach(push);
      }
    }
  }

  const content: any[] = [
    block("BackLink", { label: "All studies", link: { href: "/studies" }, layout: L("wide", "none") }),
    block("StudyHeader", { title: meta.title, hook: meta.hook, credits: meta.credits, cover: photo(coverRaw), coverShape: "wide", layout: L("wide", "none") }),
  ];
  body.forEach((b, i) => {
    const space = i === 0 ? (b.type === "heading" ? "s" : "none") : b.type === "heading" ? "m" : "s";
    const section = body.slice(0, i).findLast((x) => x.type === "heading") as { text: string } | undefined;
    const title = section ? `${meta.title}, ${section.text.toLowerCase()}` : meta.title;
    if (b.type === "heading") content.push(block("Heading", { text: b.text, size: "title", level: "h2", align: "start", layout: L("text", space) }));
    if (b.type === "para") content.push(block("Text", { text: `<p>${esc(b.text)}</p>`, style: "body", align: "start", measure: "normal", layout: L("text", space) }));
    if (b.type === "keywords") content.push(block("Keywords", { items: b.items.map((label) => ({ label })), layout: L("text", space) }));
    if (b.type === "list") content.push(block("Text", { text: `<p>${esc(b.lead)}</p><ol>${b.items.map((it) => `<li><p>${esc(it)}</p></li>`).join("")}</ol>`, style: "body", align: "start", measure: "normal", layout: L("text", space) }));
    if (b.type === "images") content.push(block("StudyImages", { photos: b.images.map((p) => ({ photo: p })), title, layout: L("text", space) }));
  });
  content.push(
    block("StudyFooter", {
      note: "Words and images from Shruchi’s Behance.",
      sources: sources.map((p: any, i: number) => ({ label: sources.length > 1 ? `Part ${i + 1}` : "See the original", href: p.behanceUrl })),
      showNext: true,
      layout: L("text", "l"),
    }),
  );
  return {
    root: { props: { title: meta.title, path: `/studies/${meta.slug}`, kind: "study", description: meta.hook, draft: false, shareImage: null, collection: "" } },
    content,
    zones: {},
  };
}

// ------------------------------------------------------------------- pages

const featured = studyMeta.filter((s: any) => s.featured);
const sheetItems = featured.map((s: any, i: number) => ({ study: `study-${s.slug}`, size: i === 0 || i === 5 ? "wide" : "sheet" }));

const HERO = [
  ["rasaa", "Kinari", "Brick Red"],
  ["ratna", "Kadamba", "Crimson Red"],
  ["ratna", "Tara", "Indigo"],
  ["entwine", "Glen", "Mist Blue"],
  ["rasaa", "Mudra", "Teal"],
  ["pause", "Sienna", "Geometric"],
  ["entwine", "Elba", "Rust"],
  ["rasaa", "Kolam", "Pepper Green"],
  ["archive", "Eden", "Mustard"],
  ["archive", "Pergola", "Indigo"],
];

const page = (title: string, p: string, description: string, content: any[], extra: Record<string, unknown> = {}) => ({
  root: { props: { title, path: p, kind: "page", description, draft: false, shareImage: null, collection: "", ...extra } },
  content,
  zones: {},
});

const pages: Record<string, any> = {};

pages.home = page("Home", "/", "The textile work of Shruchi Jaiswal: print, weave and embroidery from Indian craft traditions, and the home collections she designs as Design Lead at The Yellow Dwelling.", [
  block("HomeHero", {
    label: "Shruchi Jaiswal, textile designer",
    role: "Design Lead at The Yellow Dwelling",
    intro: "Shruchi Jaiswal draws motifs from craft, ritual and place, and turns them into cloth that people live with.",
    ctaLabel: "Open the collections",
    cta: { href: "/collections" },
    picks: HERO.map(([c, d, cw]) => ({ pick: pick(c, d, cw) })),
    showNav: true,
  }),
  block("Section", {
    title: "Collections",
    lede: "Five collections designed as Design Lead at The Yellow Dwelling, Bangalore. Open a card to see every design in its colourways.",
    level: "h2",
    align: "start",
    background: "none",
    hole: true,
    content: [block("CollectionCards", { show: "all", chosen: [], level: "h3", layout: L("wide", "none") })],
    layout: L("wide", "xl", { anchor: "collections" }),
  }),
  block("Section", {
    title: "Studies",
    lede: "Earlier work, in her own words: projects with weavers, block printers and embroiderers, from Ajrak to Ikat.",
    level: "h2",
    align: "start",
    background: "none",
    hole: true,
    content: [block("StudySheets", { items: sheetItems, others: "small", level: "h3", layout: L("wide", "none") })],
    layout: L("wide", "xl", { anchor: "studies" }),
  }),
  block("Section", {
    title: "From a mask to a motif to cloth",
    lede: "Sura, followed from what she looked at to what she printed.",
    level: "h2",
    align: "start",
    background: "none",
    hole: true,
    content: [
      block("ProcessSteps", {
        steps: [
          { verb: "Look", photo: studyImage("sura", 1, "A board of African masks, gathered as research for Sura"), text: "African masks, each carrying an emotion, gathered on a board." },
          { verb: "Draw", photo: studyImage("sura", 3, "Pencil motif explorations with masks hidden in geometric pattern"), text: "Motifs drawn so the faces hide inside the pattern." },
          { verb: "Make", photo: studyImage("sura", 7, "Carved wooden printing blocks resting on printed cloth"), text: "Blocks carved, and the motifs printed as Ajrak." },
        ],
        moreLabel: "How she works",
        more: { href: "/practice" },
        layout: L("wide", "none"),
      }),
    ],
    layout: L("wide", "xl"),
  }),
  block("Section", {
    title: "Every swatch on these cards",
    lede: "{colourways} colourways of {designs} designs. Each one opens its card.",
    level: "h2",
    align: "start",
    background: "none",
    hole: true,
    content: [block("ShadeBoard", { show: "all", chosen: [], layout: L("wide", "none") })],
    layout: L("wide", "xl"),
  }),
]);

pages.collections = page("Collections", "/collections", "Rasaa, Entwine, Ratna, Pause and earlier seasons: the home collections Shruchi Jaiswal designs at The Yellow Dwelling.", [
  block("PageTitle", { title: "Collections", lede: "Five collections designed as Design Lead at The Yellow Dwelling, Bangalore. Each card holds every design in its colourways.", facts: [], backLabel: "", back: { href: "" }, layout: L("wide", "none") }),
  block("CollectionCards", { show: "all", chosen: [], level: "h2", layout: L("wide", "none") }),
]);

pages.studies = page("Studies", "/studies", "Craft projects by Shruchi Jaiswal: Ajrak, Tangaliya, Kantha, Kalamkari, Ikat and more, in her own words.", [
  block("PageTitle", { title: "Studies", lede: "Earlier work, in her own words: projects with weavers, block printers and embroiderers, from Ajrak to Ikat.", facts: [], backLabel: "", back: { href: "" }, layout: L("wide", "none") }),
  block("StudySheets", { items: sheetItems, others: "small", level: "h2", layout: L("wide", "none") }),
]);

const ex = (source: string, index: number, alt: string, text: string, href: string) => ({ photo: studyImage(source, index, alt), text, link: { href } });

pages.practice = page("Practice", "/practice", "How Shruchi Jaiswal works: looking at a place, ritual or object, drawing the motif out of it, and making it into cloth.", [
  block("PageTitle", {
    title: "Practice",
    lede: "Shruchi Jaiswal is a textile designer trained at NID. As Design Lead at The Yellow Dwelling in Bangalore she designs its curtains, blinds, cushions and linen, collection after collection.",
    facts: [
      { label: "Now", value: "Design Lead, The Yellow Dwelling, Bangalore" },
      { label: "Trained", value: "National Institute of Design (NID)" },
      { label: "Earlier", value: "Collections for This and That, Ahmedabad" },
      { label: "Crafts", value: "Ajrak, Kalamkari, Tangaliya, Kantha, Ikat, Tholu Bommalata, zari, Arashi shibori" },
    ],
    backLabel: "",
    back: { href: "" },
    layout: L("wide", "none"),
  }),
  block("PracticeWay", {
    verb: "Look",
    summary: "Every project starts somewhere specific: a field, a festival, a dance, a mask.",
    examples: [
      ex("kapaas", 2, "A single cotton boll on its stem", "Kapaas began with a walk through a cotton farm.", "/studies/kapaas"),
      ex("gangireddu", 0, "A decorated ox and its handlers at the Gangireddu festival", "Gangireddu began with the decorated oxen of an Andhra harvest festival.", "/studies/gangireddu"),
      ex("ikkat-weaving", 1, "Odissi dancers in costume and headgear", "The ikats began with Odissi dancers: their headgear, waistband and stance.", "/studies/ikat"),
    ],
    layout: L("wide", "none"),
  }),
  block("PracticeWay", {
    verb: "Draw",
    summary: "The motif is drawn out of what she saw, until it can repeat.",
    examples: [
      ex("sura", 3, "Pencil motif explorations with hidden masks", "For Sura, masks hidden inside buta, bel and jaal motifs.", "/studies/sura"),
      ex("tangaliya", 1, "Motifs extracted from carved Bastar furniture", "For Tangaliya, motifs lifted from the carving on Bastar furniture.", "/studies/tangaliya"),
      ex("chitrakatha-bag", 10, "Character drawings of the river goddess for the comic", "For Chitrakatha, characters drawn in the style of Tholu Bommalata puppets.", "/studies/chitrakatha-bag"),
    ],
    layout: L("wide", "none"),
  }),
  block("PracticeWay", {
    verb: "Make",
    summary: "Then the material answers: carved, woven, stitched, printed.",
    examples: [
      ex("tangaliya", 4, "Woven Tangaliya cushions on a bed", "Woven by the Tangaliya weavers of Gujarat.", "/studies/tangaliya"),
      ex("ikkat-weaving", 7, "Woven ikat samples hanging in folds", "Tied, dyed and woven as ikat under traditional ikat experts.", "/studies/ikat"),
      ex("chitrakatha-bag", 13, "Kalamkari artisans printing the bags by hand", "Block printed in indigo by Kalamkari artisans.", "/studies/chitrakatha-bag"),
    ],
    layout: L("wide", "none"),
  }),
  block("Quotes", {
    title: "In her words",
    quotes: [
      { quote: "The fragile cotton bolls push themselves out of their protecting layers to come out and bloom.", from: "Kapaas", link: { href: "/studies/kapaas" } },
      { quote: "It was my intention to make the guests take back memories and experience from this place.", from: "Chitrakatha bag", link: { href: "/studies/chitrakatha-bag" } },
      { quote: "Ikat being one of the famous Indian textiles, I wanted to combine it with another Indian art form.", from: "Ikat weaving", link: { href: "/studies/ikat" } },
    ],
    layout: L("wide", "none"),
  }),
  block("ThenNow", {
    title: "A flower that came back",
    text: "Kadamb, the flower on an Odissi dancer’s headgear, was the first concept in her ikat study. Years later Kadamba is a design in Ratna, the festive collection for 2025.",
    linkLabel: "Kadamba in Ratna",
    link: { href: "/collections/ratna#kadamba" },
    then: { kind: "photo", photo: studyImage("ikkat-weaving", 3, "Kadamb: an ikat design from the Odissi headgear"), design: "", caption: "Kadamb, ikat study" },
    now: { kind: "design", photo: null, design: "ratna/kadamba", caption: "Kadamba, Ratna 2025" },
    layout: L("wide", "none"),
  }),
]);

for (const c of collections) {
  pages[`collection-${c.slug}`] = {
    root: { props: { title: c.name, path: `/collections/${c.slug}`, kind: "collection", description: c.intro, draft: false, shareImage: null, collection: c.slug } },
    content: [
      block("BackLink", { label: "All collections", link: { href: "/collections" }, layout: L("wide", "none") }),
      block("CollectionCard", {
        collection: c.slug,
        note: "{count}. Designed by Shruchi as Design Lead at The Yellow Dwelling; descriptions are the shop’s own.",
        showIndex: true,
        extra: [],
        layout: L("wide", "xs"),
      }),
      block("CollectionPager", { collection: c.slug, layout: L("wide", "none") }),
    ],
    zones: {},
  };
}

for (const s of studyMeta) pages[`study-${s.slug}`] = studyPage(s);

pages["not-found"] = page("Page not found", "/not-found", "", [
  block("PageTitle", { title: "This card isn’t in the book", lede: "", facts: [], backLabel: "", back: { href: "" }, layout: L("wide", "none") }),
  block("Text", {
    text: '<p>The page you followed doesn’t exist. The <a href="/collections/">collections</a> and <a href="/studies/">studies</a> are all here.</p>',
    style: "lead",
    align: "start",
    measure: "normal",
    layout: L("wide", "none"),
  }),
]);

// -------------------------------------------------------------------- site

const site = {
  name: "ras.ruchi",
  nameDevanagari: "रसरुचि",
  person: "Shruchi Jaiswal",
  role: "Textile designer",
  description: "The textile work of Shruchi Jaiswal: print, weave and embroidery from Indian craft traditions, and the home collections she designs as Design Lead at The Yellow Dwelling.",
  email: "xyz@gmail.com",
  shop: { name: "The Yellow Dwelling", url: "https://theyellowdwelling.com/" },
  nav: [
    { label: "Collections", href: "/collections" },
    { label: "Studies", href: "/studies" },
    { label: "Practice", href: "/practice" },
    { label: "Contact", href: "#contact" },
  ],
  links: [
    { label: "Instagram @ras.ruchi", href: "https://www.instagram.com/ras.ruchi/" },
    { label: "Behance", href: "https://www.behance.net/shruchijaiswal" },
    { label: "The Yellow Dwelling", href: "https://theyellowdwelling.com/" },
  ],
  footer: {
    heading: "Write to Shruchi",
    credit: "Product photographs courtesy of The Yellow Dwelling. Study images from Shruchi’s Behance.",
    copyright: "© {year} Shruchi Jaiswal",
  },
  shades: [
    { id: "kolam-green", name: "Kolam green", hex: "#33503f" },
    { id: "glen-mist-blue", name: "Glen mist blue", hex: "#56698a" },
    { id: "kadamba-oxblood", name: "Kadamba oxblood", hex: "#6a2222" },
    { id: "sienna-mustard", name: "Sienna mustard", hex: "#d9a64a" },
    { id: "pergola-indigo", name: "Pergola indigo", hex: "#2c3d63" },
  ],
  shareImage: null,
  pageOrder: ["home", "collections", ...collections.map((c: any) => `collection-${c.slug}`), "studies", ...studyMeta.map((s: any) => `study-${s.slug}`), "practice", "not-found"],
};

// ------------------------------------------------------------------- write

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(path.join(OUT, "pages"), { recursive: true });
const write = (rel: string, data: unknown) => fs.writeFile(path.join(OUT, rel), JSON.stringify(data, null, 2) + "\n");
await write("site.json", site);
await write("collections.json", collections);
await write("media.json", media);
for (const [pid, data] of Object.entries(pages)) await write(`pages/${pid}.json`, data);
console.log(`content/: ${Object.keys(pages).length} pages, ${collections.length} collections, ${media.length} photos`);
