// File access for the Studio's save API. Runs only in the local development
// server: everything here reads and writes inside this project folder.
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const ROOT = process.cwd();
export const CONTENT = path.join(ROOT, "content");
export const PUBLIC = path.join(ROOT, "public");
export const STUDIO_DIR = path.join(ROOT, ".studio");
export const HISTORY = path.join(STUDIO_DIR, "history");
export const PUBLISHED = path.join(STUDIO_DIR, "published");

const PAGE_ID = /^[a-z0-9][a-z0-9-]{0,80}$/;

export function pageFile(id: string): string {
  if (!PAGE_ID.test(id)) throw new Error(`Not a page name: ${id}`);
  return path.join(CONTENT, "pages", `${id}.json`);
}

/** Content files by their short name: "site", "collections", "media", "pages/home". */
export function contentFile(name: string): string {
  if (name === "site" || name === "collections" || name === "media") return path.join(CONTENT, `${name}.json`);
  if (name.startsWith("pages/")) return pageFile(name.slice(6));
  throw new Error(`Unknown content file: ${name}`);
}

export async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

/** Writes through a temporary file, so a crash never leaves half a file behind. */
export async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n");
  await fs.rename(tmp, file);
}

export async function exists(file: string) {
  return fs
    .stat(file)
    .then(() => true)
    .catch(() => false);
}

export const sha1 = (buf: Buffer | string) => createHash("sha1").update(buf).digest("hex");

/** Every content file as a short name, for history and publishing. */
export async function contentNames(): Promise<string[]> {
  const pages = (await fs.readdir(path.join(CONTENT, "pages"))).filter((f) => f.endsWith(".json")).map((f) => `pages/${f.replace(/\.json$/, "")}`);
  return ["site", "collections", "media", ...pages.sort()];
}

/** A public path like "/media/x.webp" to a file on disk, refusing anything outside public/. */
export function publicFile(src: string): string {
  const clean = decodeURIComponent(src.split("?")[0]);
  const file = path.join(PUBLIC, clean);
  if (!file.startsWith(PUBLIC + path.sep)) throw new Error("Outside the public folder");
  return file;
}
