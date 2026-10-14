// Downloads Shruchi's work from Behance and The Yellow Dwelling, optimizes it to
// WebP with sharp, and writes typed content data to src/data/*.json.
// Run with: node scripts/fetch-images.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "scripts/data");
const OUT_IMG = path.join(ROOT, "public/images");
const OUT_DATA = path.join(ROOT, "src/data");
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh) portfolio-builder" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBuf(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: UA, redirect: "follow" });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (res.status === 404 || res.status === 403) return null;
    } catch {}
    await sleep(800 * (attempt + 1));
  }
  return null;
}

// Encode to WebP and return the metadata the site needs: the public src, size, a
// tiny blur placeholder, and the dominant colour for loading backgrounds. A hash
// of the bytes goes into the file name, so a re-cut image always gets a new URL
// and no image cache can serve the old one.
async function encode(buf, outFile, { maxWidth = 2000, animated = false } = {}) {
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const img = sharp(buf, { animated, limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  const pipeline = img.resize({ width: Math.min(maxWidth, meta.width ?? maxWidth), withoutEnlargement: true });
  const { data, info } = await pipeline.webp({ quality: animated ? 65 : 74, effort: 5 }).toBuffer({ resolveWithObject: true });
  const hash = createHash("sha1").update(data).digest("hex").slice(0, 8);
  const finalFile = outFile.replace(/\.webp$/, `-${hash}.webp`);
  await fs.writeFile(finalFile, data);
  const still = sharp(buf, { limitInputPixels: false }).rotate();
  const [blur, stats] = await Promise.all([
    still.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer(),
    still.clone().stats(),
  ]);
  const { r, g, b } = stats.dominant;
  const height = animated ? info.height / (meta.pages ?? 1) : info.height;
  return {
    src: "/" + path.relative(path.join(ROOT, "public"), finalFile).split(path.sep).join("/"),
    width: info.width,
    height: Math.round(height),
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    color: `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
  };
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

// ---------------------------------------------------------------- Behance

const BEHANCE_CDN = "https://mir-s3-cdn-cf.behance.net/project_modules";

async function behance() {
  await fs.rm(path.join(OUT_IMG, "behance"), { recursive: true, force: true });
  const raw = JSON.parse(await fs.readFile(path.join(DATA, "behance-raw.json"), "utf8"));
  const jobs = [];
  for (const p of raw) {
    const slug = p.slug.toLowerCase();
    let n = 0;
    for (const block of p.seq) {
      if (block.i) jobs.push({ slug, id: block.i, block, index: n++ });
    }
    if (p.cover && !p.seq.some((b) => b.i === p.cover)) jobs.push({ slug, id: p.cover, block: (p.coverBlock = {}), index: "cover" });
  }

  let done = 0;
  await pool(jobs, 6, async (job) => {
    const isGif = job.id.endsWith(".gif");
    const sizes = isGif ? ["max_1200", "1400", "source"] : ["fs", "1400", "max_1200"];
    let buf = null;
    for (const s of sizes) {
      buf = await fetchBuf(`${BEHANCE_CDN}/${s}/${job.id}`);
      if (buf) break;
    }
    if (!buf) return console.warn("  ! missing", job.slug, job.id);
    const file = `behance/${job.slug}/${String(job.index).padStart(2, "0")}.webp`;
    try {
      const meta = await encode(buf, path.join(OUT_IMG, file), { maxWidth: isGif ? 1000 : 1800, animated: isGif });
      Object.assign(job.block, { ...meta, animated: isGif || undefined });
    } catch (e) {
      console.warn("  ! encode failed", job.id, e.message);
    }
    if (++done % 10 === 0) console.log(`  behance ${done}/${jobs.length}`);
  });

  const projects = raw.map((p) => ({
    slug: p.slug.toLowerCase(),
    title: p.title,
    subtitle: p.sub,
    behanceUrl: p.url,
    cover: p.seq.find((b) => b.i === p.cover)?.src ?? p.coverBlock?.src ?? p.seq.find((b) => b.src)?.src,
    blocks: p.seq
      .map((b) => (b.i ? (b.src ? { type: "image", src: b.src, width: b.width, height: b.height, blur: b.blur, color: b.color, animated: b.animated } : null) : { type: "text", text: b.t }))
      .filter(Boolean),
  }));
  await fs.writeFile(path.join(OUT_DATA, "behance.json"), JSON.stringify(projects, null, 2));
  console.log(`Behance: ${projects.length} projects, ${jobs.length} images`);
}

// ------------------------------------------------------ The Yellow Dwelling

// Collections Shruchi designed as Design Lead, newest first. Each design lists
// its colourways as [label, title tokens]; a colourway matches a product whose
// title starts with the design name and contains every token. A design with no
// colourways list matches any product with that name.
const COLLECTIONS = [
  {
    slug: "rasaa",
    name: "Rasaa",
    season: "Festive ensemble 2026",
    match: (p, inCol) => p.tags.some((t) => t.startsWith("col_rasaa")) || inCol("festive-collection-2026"),
    designs: [
      ["Kinari", [["Brick Red", ["brick red"]], ["Herb Green", ["herb green"]], ["Pink Sand", ["pink sand"]], ["Honey Yellow", ["honey yellow"]]]],
      ["Mogra", [["Walnut Grey", ["walnut"]], ["Mahogany Brown", ["mahogany"]], ["Fig Brown", ["fig"]], ["Elephant Grey", ["elephant"]], ["Chocolate Brown", ["chocolate"]]]],
      ["Ketaki", [["Rust", ["rust"]], ["Nilgiri Blue", ["nilgiri"]], ["Mist Blue", ["mist"]], ["Ultimate Grey", ["ultimate"]], ["White", ["white"]]]],
      ["Daaram", [["Gold & Beige", ["gold"]]]],
      ["Kolam", [["Pepper Green", ["pepper"]]]],
      ["Gulnaar", [["Green", []]]],
      ["Baagh", [["Mustard", []]]],
      ["Meher", [["Blue", []]]],
      ["Ira", [["Pink & Blue", []]]],
      ["Rohida", [["Red", []]]],
      ["Mudra", [["Teal", []]]],
      ["Nargis", [["Green & Mustard", ["mustard"]]]],
      ["Tala", [["Teal", []]]],
      ["Madhuram", [["Green & Beige", []]]],
    ],
  },
  {
    slug: "entwine",
    name: "Entwine",
    season: "Summer 2026",
    match: (p, inCol) => p.tags.some((t) => t.includes("entwine")) || inCol("summer-entwine-2026"),
    designs: [
      ["Elba", [["Rust", ["rust"]], ["Marine Teal", ["marine"]], ["Cream", ["cream"]], ["White", ["white"]]]],
      ["Glen", [["Mist Blue", ["mist"]], ["Herb Green", ["herb"]], ["Basil Green", ["basil"]], ["Beige", ["beige"]]]],
      ["Roselle", [["Pink", ["pink"]], ["Sage Green", ["sage"]]]],
      ["Flutter", [["Pink", []]]],
      ["Peony", [["Cream", []]]],
      ["Arden", [["Teal", []]]],
      ["Feather", [["Brown", []]]],
      ["Juniper", [["Green", []]]],
      ["Pomera", [["Grey", []]]],
      ["Malabar", [["Marine Teal", []]]],
      ["Field", [["Brown", []]]],
      ["Truffle", [["Brown", []]]],
    ],
  },
  {
    slug: "ratna",
    name: "Ratna",
    season: "Festive 2025",
    match: (p) => p.tags.includes("col_festive-collection-2025"),
    designs: [
      ["Kadamba", [["Crimson Red", ["crimson"]], ["Jade Green", ["jade"]], ["Beige", ["beige"]]]],
      ["Tara", [["Indigo", ["indigo"]], ["Brick Red", ["brick"]], ["Cream", ["cream"]]]],
      ["Durbar", [["Royal Blue & Brick Red", []]]],
      ["Palace Pillars", [["Green", []]]],
      ["Mulbagal", [["Sage & Pepper Green", []]]],
      ["Parijatha", [["Multicolour", []]]],
      ["Meenakshi", [["Herb Green", []]]],
      ["Pakkshi", [["Multicolour", []]]],
      ["Palash", [["Crimson Red", []]]],
      ["Thinnai", [["Multicolour", []]]],
      ["Mukta", [["Cream", []]]],
      ["Neela", [["Blue", []]]],
    ],
  },
  {
    slug: "pause",
    name: "Pause",
    season: "Summer 2025",
    match: (p, inCol) => inCol("pause-summer-2025") || p.tags.includes("Summer_new_2025"),
    designs: [
      ["Rustle", [["Herb Green", ["herb"]], ["Mahogany", ["moh"]]]],
      ["Whisper", [["Blue", []]]],
      ["Still Water", [["Green", []]]],
      ["Sakura", [["Pink", []]]],
      ["Willow", [["Floral", []]]],
      ["Fable", [["Multicolour", []]]],
      ["Celeste", [["Embroidered", []]]],
      ["Echo", [["Geometric", []]]],
      ["Sienna", [["Geometric", []]]],
      ["Posy", [["Minimal floral", []]]],
      ["Cosmos", [["Floral", []]]],
      ["Haze", [["Sheer geometric", []]]],
    ],
  },
  {
    slug: "archive",
    name: "Earlier seasons",
    season: "2022 to 2024",
    match: () => true,
    designs: [
      ["Pergola", [["Indigo", ["indigo"]], ["Nile Blue", ["nile"]]]],
      ["Gingko", [["Nile Blue", ["nile"]], ["Beige", ["beige"]]]],
      ["Climbing Roses", [["Wine Red", ["wine"]], ["Lavender", ["lavender"]]]],
      ["Eden", [["Mustard", ["mustard"]], ["Aqua Blue", ["aqua"]]]],
      ["Ivy Vines", [["Cream", ["cream"]], ["White", ["white"]]]],
      ["Lotus Pond", [["Rust", []]]],
      ["Spice Route", [["Sage Green", []]]],
      ["Sacred Waters", [["Sheer floral", []]]],
      ["Sunbird", [["Sheer floral", []]]],
      ["Mallige", [["Sheer geometric", []]]],
      ["Sitara", [["Sheer geometric", []]]],
      ["Wild Roses", [["Floral", []]]],
      ["French Farmhouse", [["Floral", []]]],
      ["Indus", [["Ethnic", []]]],
    ],
  },
];

const GENERIC = /^(sheer_curtain_|Sheer_curtain_1200|cotton_curtain_|All_Curtains|hardware|blind_final|Blind_\d_|cushion_[0-9a-f]{6}|Regular_curtain|curtain\d_|curtaincareguide)|size_?chart|measure/i;
const SWATCH_TYPES = ["Printed Fabric", "Blind", "Cushion Covers", "Standard Curtains", "Combo Curtains", "Table Runner", "Table Cloth"];
const SCENE_TYPES = ["Combo Curtains", "Blind", "Standard Curtains", "Cushion Covers", "Combo Cushion Covers", "Table Runner", "Table Cloth"];

const clean = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

// The shop's own words about the cloth: from the most design-specific listing,
// keep sentences about border, motif, print and colour; drop sales lines.
const STORY_TYPES = ["Blind", "Standard Curtains", "Cushion Covers", "Table Runner", "Combo Curtains", "Combo Cushion Covers"];
const SALES =
  /^(bring|brighten|elevate|enhance|refresh|add|infuse|celebrate|upgrade|introducing|make a statement|this pack|a set of|crafted from|made (of|from)|perfect|ideal|pair|get in touch|together|elegant yet|created to pair|with this|this festival season|whether|and also)|style tip|set of \d|combo|perfect for|ideal for|great .* option|your (home|space|living|dining)|living (room|space)|to the space|interiors|sofas|windows|single curtain|blackout|installation|\bcare\b|^width|wider|lining|block ?out|light block|styles well|covers approximately|\d+"/i;
// Obvious slips in the shop's copy, corrected so they don't read as ours.
const TYPOS = [
  [/\bcram base\b/g, "cream base"],
  [/\bbase base\b/g, "base"],
  [/\bgeomtric\b/g, "geometric"],
  [/\bcele brates\b/g, "celebrates"],
  [/\binspired form\b/g, "inspired from"],
  [/\bour our\b/g, "our"],
  [/\bKeteki\b/g, "Ketaki"],
];
const DESIGN = /border|motif|print|floral|flower|geometric|ikat|ikkat|zari|embroider|inspired|hue|tone|pattern|lotus|symbol|texture|bunches|butis|stripe|sprig|leaves|vine|bloom/i;

function story(products, name) {
  for (const p of products.toSorted(by(rank(STORY_TYPES)))) {
    const text = clean(p.body_html).split(/Get in touch|Quantity:|Material ?:|Size ?:|Dimensions|Note ?:|Specifications/i)[0];
    const sentences = (text.match(/[^.!?]+[.!?]+/g) ?? []).map((x) => x.trim()).filter((x) => !SALES.test(x));
    const kept = sentences.filter((x) => DESIGN.test(x));
    // With nothing about the design itself, fall back to the first plain descriptive sentence.
    const chosen = kept.length ? kept.slice(0, 2) : sentences.filter((x) => x.toLowerCase().includes(name.toLowerCase()) && x.length > 40).slice(0, 1);
    if (chosen.length) {
      let out = chosen.join(" ").replace(/\s*[—–]\s*/g, ", ").replace(/\s+/g, " ").trim();
      for (const [re, to] of TYPOS) out = out.replace(re, to);
      return out;
    }
  }
  return "";
}

// Combo listings describe their partner designs too, so read the design's own listings first.
function technique(products) {
  const own = products.filter((p) => !p.product_type.startsWith("Combo"));
  const src = own.length ? own : products;
  const t = src.map((p) => `${p.title} ${clean(p.body_html)}`).join(" ").toLowerCase();
  const titles = src.map((p) => p.title.toLowerCase()).join(" ");
  if (t.includes("zari")) return "Woven zari border";
  if (t.includes("ajrakh") || t.includes("ajrak")) return "Ajrakh-inspired print";
  if (t.includes("ikat") || t.includes("ikkat")) return "Ikat-inspired print";
  if (/embroider\w* (geo[- ]floral |floral |)(border|trim)/.test(t)) return "Embroidered border";
  if (t.includes("embroider")) return "Embroidered";
  if (/\blace\b/.test(t) && !titles.includes("print")) return "Lace trim";
  if (/\bcrochet\b/.test(t) && !titles.includes("print")) return "Crochet";
  if (titles.includes("sheer")) return "Printed sheer";
  if (titles.includes("woven") || titles.includes("textured")) return "Woven texture";
  return "Printed";
}

// Hand-picked swatch photos where the default choice shows a room, not cloth:
// [product type, image index] by "Design/Colourway". Both were checked by eye.
const SWATCH_OVERRIDES = {
  "Gingko/Beige": ["Standard Curtains", 3],
  "Celeste/Embroidered": ["Cushion Covers", 1, { x: 0.2, y: 0.02, w: 0.6, h: 0.42 }],
};

const ownImages = (p) => (p ? p.images.filter((im) => !GENERIC.test(im.src.split("/").pop().split("?")[0])) : []);
const rank = (types) => (p) => {
  const i = types.indexOf(p.product_type);
  return i < 0 ? 99 : i;
};
const by = (fn) => (a, b) => fn(a) - fn(b);

async function yellowDwelling() {
  await fs.rm(path.join(OUT_IMG, "tyd"), { recursive: true, force: true });
  const all = JSON.parse(await fs.readFile(path.join(DATA, "tyd_all.json"), "utf8"));
  const colMembers = {};
  for (const f of await fs.readdir(DATA)) {
    const m = f.match(/^tydc_(.+)\.json$/);
    if (m) colMembers[m[1]] = new Set(JSON.parse(await fs.readFile(path.join(DATA, f), "utf8")).products.map((p) => p.handle));
  }
  const jobs = [];
  const collections = [];
  for (const col of COLLECTIONS) {
    const products = all.filter((p) => col.match(p, (slug) => colMembers[slug]?.has(p.handle)));
    const designs = [];
    for (const [name, colourways] of col.designs) {
      const named = products.filter((p) => p.title.toLowerCase().startsWith(name.toLowerCase() + " "));
      if (!named.length) {
        console.warn(`  ! ${col.slug}: no product for "${name}"`);
        continue;
      }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const design = {
        slug,
        name,
        technique: technique(named),
        story: story(named, name),
        colourways: [],
      };
      for (const [label, tokens] of colourways.slice(0, 5)) {
        const matches = named.filter((p) => tokens.every((t) => p.title.toLowerCase().includes(t)));
        if (!matches.length) {
          console.warn(`  ! ${col.slug}/${name}: no product for colourway "${label}"`);
          continue;
        }
        // Her flat fabric listing makes the truest swatch, even when the shop files it outside this collection.
        const fabric = all.find(
          (p) => p.product_type === "Printed Fabric" && p.title.toLowerCase().startsWith(name.toLowerCase() + " ") && tokens.every((t) => p.title.toLowerCase().includes(t)) && ownImages(p).length,
        );
        const override = SWATCH_OVERRIDES[`${name}/${label}`];
        const overrideProduct = override && all.find((p) => p.product_type === override[0] && p.title.toLowerCase().startsWith(name.toLowerCase() + " ") && tokens.every((t) => p.title.toLowerCase().includes(t)));
        const swatchProduct = overrideProduct ?? fabric ?? matches.filter((p) => ownImages(p).length).toSorted(by(rank(SWATCH_TYPES)))[0];
        const sceneProduct = matches.filter((p) => ownImages(p).length).toSorted(by(rank(SCENE_TYPES)))[0];
        if (!swatchProduct) continue;
        const swatchImg = overrideProduct ? overrideProduct.images[override[1]] : ownImages(swatchProduct)[0];
        // Scene: a combo's first shot is the dressed room; a blind's second is the zoomed-out view.
        const sceneImgs = ownImages(sceneProduct).filter((im) => im.src !== swatchImg.src);
        const sceneImg = sceneProduct.product_type === "Blind" && sceneImgs.length > 1 && sceneProduct === swatchProduct ? sceneImgs[0] : sceneImgs[0];
        const cw = {
          name: label,
          url: `https://theyellowdwelling.com/products/${sceneProduct.handle}`,
          seenAs: sceneProduct.product_type,
          // An overridden photo is already a cloth close-up, so it is cut like flat fabric.
          swatchFrom: overrideProduct ? "Printed Fabric" : swatchProduct.product_type,
          ...(override?.[2] ? { chipCrop: override[2] } : {}),
          swatch: null,
          scene: null,
        };
        const cwSlug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        jobs.push({ target: cw, key: "swatch", url: swatchImg.src, file: `tyd/${col.slug}/${slug}--${cwSlug}--swatch.webp` });
        // Only the first colourway carries a room shot; the rest are swatches.
        if (design.colourways.length === 0 && sceneImg && sceneImg.src !== swatchImg.src) {
          jobs.push({ target: cw, key: "scene", url: sceneImg.src, file: `tyd/${col.slug}/${slug}--${cwSlug}--scene.webp` });
        }
        design.colourways.push(cw);
      }
      if (design.colourways.length) designs.push(design);
    }
    collections.push({ slug: col.slug, name: col.name, season: col.season, designs });
  }

  let done = 0;
  await pool(jobs, 6, async (job) => {
    const url = job.url.split("?")[0] + "?width=1400";
    const buf = await fetchBuf(url);
    if (!buf) return console.warn("  ! missing", url);
    try {
      const meta = await encode(buf, path.join(OUT_IMG, job.file), { maxWidth: 1400 });
      job.target[job.key] = meta;
    } catch (e) {
      console.warn("  ! encode failed", url, e.message);
    }
    if (++done % 20 === 0) console.log(`  tyd ${done}/${jobs.length}`);
  });
  for (const c of collections) for (const d of c.designs) d.colourways = d.colourways.filter((cw) => cw.swatch);

  await fs.writeFile(path.join(OUT_DATA, "yellow-dwelling.json"), JSON.stringify(collections, null, 2));
  const cws = collections.reduce((n, c) => n + c.designs.reduce((m, d) => m + d.colourways.length, 0), 0);
  console.log(`Yellow Dwelling: ${collections.reduce((n, c) => n + c.designs.length, 0)} designs, ${cws} colourways, ${jobs.length} images`);
}

// Square swatch chips cut from each colourway's photo. Blind and cushion shots
// include the room, so crop to the cloth; flat fabric and drapery use the centre.
const CHIP_CROPS = {
  Blind: { x: 0.12, y: 0.03, w: 0.64, h: 0.44 },
  "Cushion Covers": { x: 0.32, y: 0.3, w: 0.36, h: 0.26 },
  "Combo Cushion Covers": { x: 0.32, y: 0.3, w: 0.36, h: 0.26 },
};

// The cloth's ground colour: the most common 4-bit colour bin, then the true
// average of the pixels in that bin, so the printed hex is measured, not rounded.
async function groundShade(buf) {
  const { data } = await sharp(buf).resize(48, 48, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bins = new Map();
  for (let i = 0; i < data.length; i += 3) {
    const key = (data[i] >> 4) * 256 + (data[i + 1] >> 4) * 16 + (data[i + 2] >> 4);
    const b = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    b.n++; b.r += data[i]; b.g += data[i + 1]; b.b += data[i + 2];
    bins.set(key, b);
  }
  const top = [...bins.values()].reduce((a, b) => (b.n > a.n ? b : a));
  return "#" + [top.r, top.g, top.b].map((v) => Math.round(v / top.n).toString(16).padStart(2, "0")).join("");
}

async function chips() {
  const file = path.join(OUT_DATA, "yellow-dwelling.json");
  const collections = JSON.parse(await fs.readFile(file, "utf8"));
  const jobs = collections.flatMap((c) => c.designs.flatMap((d) => d.colourways));
  await pool(jobs, 6, async (cw) => {
    const srcFile = path.join(ROOT, "public", cw.swatch.src);
    const img = sharp(srcFile);
    const { width, height } = await img.metadata();
    const c = cw.chipCrop ?? CHIP_CROPS[cw.swatchFrom];
    let region;
    if (c) {
      region = { left: Math.round(c.x * width), top: Math.round(c.y * height), width: Math.round(c.w * width), height: Math.round(c.h * height) };
    } else {
      // Flat fabric fills the frame; hung curtains and runners get a closer centre crop.
      const flat = cw.swatchFrom === "Printed Fabric";
      const side = Math.round(Math.min(width, height) * (flat ? 0.6 : 0.46));
      region = { left: Math.round((width - side) / 2), top: Math.round(height * (flat ? 0.5 : 0.42) - side / 2), width: side, height: side };
    }
    const outRel = cw.swatch.src.replace(/--swatch(-[0-9a-f]{8})?\.webp$/, "--chip.webp");
    if (cw.chip?.src) await fs.rm(path.join(ROOT, "public", cw.chip.src), { force: true });
    const buf = await img.extract(region).resize(720, 720, { fit: "cover" }).toBuffer();
    const meta = await encode(buf, path.join(ROOT, "public", outRel), { maxWidth: 720 });
    cw.chip = { ...meta, shade: await groundShade(buf) };
  });
  await fs.writeFile(file, JSON.stringify(collections, null, 2));
  console.log(`Chips: ${jobs.length}`);
}

await fs.mkdir(OUT_DATA, { recursive: true });
const only = process.argv[2];
if (!only || only === "behance") await behance();
if (!only || only === "tyd") await yellowDwelling();
if (!only || only === "tyd" || only === "chips") await chips();
