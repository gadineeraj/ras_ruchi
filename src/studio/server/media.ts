// Photos and videos added in the Studio. Photos become sized WebP files with a
// blur placeholder and their main colour, the same pipeline v1 used, so a new
// photo loads exactly like the old ones. Files are named by their content, so
// a replaced photo always gets a new address and no browser shows a stale one.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Img, MediaItem } from "@/lib/content-types";
import { CONTENT, PUBLIC, contentNames, contentFile, publicFile, readJson, sha1, writeJson } from "./files";

const MAX_WIDTH = 2400;
const MAX_BYTES = 60 * 1024 * 1024;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const IMAGE = /\.(jpe?g|png|webp|gif|avif|tiff?|heic|heif)$/i;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "photo";

const toSrc = (file: string) => "/" + path.relative(PUBLIC, file).split(path.sep).join("/");

async function encode(buf: Buffer, dir: string, base: string, { animated = false, maxWidth = MAX_WIDTH } = {}): Promise<Img> {
  const img = sharp(buf, { animated, limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  const { data, info } = await img
    .resize({ width: Math.min(maxWidth, meta.width ?? maxWidth), withoutEnlargement: true })
    .webp({ quality: animated ? 65 : 80, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${base}-${sha1(data).slice(0, 8)}.webp`);
  await fs.writeFile(file, data);
  const still = sharp(buf, { limitInputPixels: false }).rotate();
  const [blur, stats] = await Promise.all([still.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer(), still.clone().stats()]);
  const { r, g, b } = stats.dominant;
  const height = animated ? info.height / (meta.pages ?? 1) : info.height;
  return {
    src: toSrc(file),
    width: info.width,
    height: Math.round(height),
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    color: `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
    ...(animated ? { animated: true } : {}),
  };
}

export class UploadError extends Error {}

/** Processes one uploaded file and adds it to the photo library. */
export async function addUpload(file: File, folder: string): Promise<MediaItem> {
  const name = file.name || "photo";
  if (file.size > MAX_BYTES) throw new UploadError(`${name} is ${(file.size / 1048576).toFixed(0)} MB. Files up to 60 MB can be published; make it smaller first.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(PUBLIC, "media", slug(folder || "uploads"));
  let item: MediaItem;
  if (VIDEO.test(name) || file.type.startsWith("video/")) {
    await fs.mkdir(dir, { recursive: true });
    const ext = (name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".mp4").toLowerCase();
    const out = path.join(dir, `${slug(name)}-${sha1(buf).slice(0, 8)}${ext}`);
    await fs.writeFile(out, buf);
    item = { src: toSrc(out), width: 1920, height: 1080, blur: "", color: "#121311", name: slug(name), alt: "", folder: folder || "Uploads", added: new Date().toISOString(), kind: "video" };
  } else if (IMAGE.test(name) || file.type.startsWith("image/")) {
    try {
      const animated = /\.gif$/i.test(name) && ((await sharp(buf).metadata()).pages ?? 1) > 1;
      const img = await encode(buf, dir, slug(name), { animated });
      item = { ...img, name: slug(name), alt: "", folder: folder || "Uploads", added: new Date().toISOString() };
    } catch {
      throw new UploadError(/\.hei[cf]$/i.test(name) ? `${name} is an iPhone HEIC photo, which can't be read here. In Photos, choose File > Export > Export 1 Photo as JPEG, then add that.` : `${name} couldn't be read as a photo.`);
    }
  } else {
    throw new UploadError(`${name} isn't a photo or a video. Photos can be JPG, PNG, WebP or GIF; videos MP4 or MOV.`);
  }
  const media = await readJson<MediaItem[]>(path.join(CONTENT, "media.json"));
  if (!media.some((m) => m.src === item.src)) media.unshift(item);
  await writeJson(path.join(CONTENT, "media.json"), media);
  return item;
}

// The cloth's ground colour: the most common 4-bit colour bin, then the true
// average of the pixels in that bin, so the printed hex is measured, not rounded.
async function groundShade(buf: Buffer) {
  const { data } = await sharp(buf).resize(48, 48, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bins = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 3) {
    const key = (data[i] >> 4) * 256 + (data[i + 1] >> 4) * 16 + (data[i + 2] >> 4);
    const bin = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bin.n++;
    bin.r += data[i];
    bin.g += data[i + 1];
    bin.b += data[i + 2];
    bins.set(key, bin);
  }
  const top = [...bins.values()].reduce((a, b) => (b.n > a.n ? b : a));
  return "#" + [top.r, top.g, top.b].map((v) => Math.round(v / top.n).toString(16).padStart(2, "0")).join("");
}

/** Cuts a square swatch from a photo around a point and measures its ground colour. */
export async function cutSwatch(src: string, focus: { x: number; y: number }, size: number): Promise<Img & { shade: string }> {
  const file = publicFile(src);
  const img = sharp(file);
  const { width = 0, height = 0 } = await img.metadata();
  const side = Math.max(32, Math.round(Math.min(width, height) * Math.min(1, Math.max(0.12, size))));
  const left = Math.round(Math.min(width - side, Math.max(0, (focus.x / 100) * width - side / 2)));
  const top = Math.round(Math.min(height - side, Math.max(0, (focus.y / 100) * height - side / 2)));
  const buf = await img.extract({ left, top, width: side, height: side }).resize(720, 720, { fit: "cover" }).toBuffer();
  // "kadamba--crimson-red--swatch-a1b2c3d4.webp" becomes "kadamba-crimson-red".
  const base = slug(path.basename(src).replace(/(-[0-9a-f]{8})?\.webp$/, "").replace(/--?(swatch|chip|scene)$/, ""));
  const meta = await encode(buf, path.join(PUBLIC, "media", "swatches"), `${base}-swatch`, { maxWidth: 720 });
  return { ...meta, shade: await groundShade(buf) };
}

// ---------------------------------------------------------- usage, replace

type Walkable = Record<string, unknown> | unknown[];

function walk(node: unknown, visit: (obj: Record<string, unknown>) => void) {
  if (Array.isArray(node)) node.forEach((n) => walk(n, visit));
  else if (node && typeof node === "object") {
    visit(node as Record<string, unknown>);
    Object.values(node as Record<string, unknown>).forEach((n) => walk(n, visit));
  }
}

/** Where a photo is used: page titles and the collections library. */
export async function usage(src: string) {
  const out: { file: string; title: string }[] = [];
  for (const name of await contentNames()) {
    if (name === "media") continue;
    const data = await readJson<Walkable>(contentFile(name));
    let hit = false;
    walk(data, (o) => {
      if (o.src === src) hit = true;
    });
    if (hit) {
      const title = name === "collections" ? "Collections library" : name === "site" ? "Site settings" : ((data as { root?: { props?: { title?: string } } }).root?.props?.title ?? name);
      out.push({ file: name, title });
    }
  }
  return out;
}

/** Swaps one photo for another everywhere it is used, keeping alt text and crop. */
export async function replaceEverywhere(oldSrc: string, next: Img) {
  const changed: string[] = [];
  for (const name of await contentNames()) {
    const file = contentFile(name);
    const data = await readJson<Walkable>(file);
    let hit = false;
    walk(data, (o) => {
      if (o.src === oldSrc) {
        Object.assign(o, { src: next.src, width: next.width, height: next.height, blur: next.blur, color: next.color });
        if (next.animated) o.animated = true;
        else delete o.animated;
        hit = true;
      }
    });
    if (hit) {
      await writeJson(file, data);
      changed.push(name);
    }
  }
  return changed;
}

export async function removeMedia(src: string) {
  const used = await usage(src);
  if (used.length) throw new UploadError(`This photo is still used on: ${used.map((u) => u.title).join(", ")}. Remove it there first.`);
  const media = await readJson<MediaItem[]>(path.join(CONTENT, "media.json"));
  await writeJson(
    path.join(CONTENT, "media.json"),
    media.filter((m) => m.src !== src),
  );
  if (src.startsWith("/media/")) await fs.rm(publicFile(src), { force: true });
}
