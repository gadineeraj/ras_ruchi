// Version history. Before the Studio overwrites a content file it keeps a copy
// of what was there (at most one every few minutes per file), and she can save
// a named version of the whole site at any time. Nothing here is ever sent to
// GitHub: .studio/ stays on her laptop.
import fs from "node:fs/promises";
import path from "node:path";
import { CONTENT, HISTORY, contentFile, contentNames, exists, readJson, sha1, writeJson } from "./files";

const AUTO_GAP_MS = 3 * 60 * 1000;
const KEEP_PER_FILE = 250;

export type Snapshot = { id: string; file: string; at: string; reason: string };
export type Version = { id: string; at: string; label: string; files: number };

const dirFor = (name: string) => path.join(HISTORY, "files", name.replace("/", "__"));
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");
const fromStamp = (s: string) => s.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z.*$/, "$1T$2:$3:$4.$5Z");

async function listDir(dir: string) {
  return (await exists(dir)) ? (await fs.readdir(dir)).filter((f) => f.endsWith(".json")).sort() : [];
}

/** Keeps a copy of a content file as it is now. */
export async function snapshot(name: string, reason: string, { force = false } = {}) {
  const file = contentFile(name);
  if (!(await exists(file))) return null;
  const body = await fs.readFile(file, "utf8");
  const dir = dirFor(name);
  const entries = await listDir(dir);
  const last = entries.at(-1);
  if (last) {
    const lastBody = await fs.readFile(path.join(dir, last), "utf8");
    if (sha1(lastBody) === sha1(body)) return null;
    const age = Date.now() - new Date(fromStamp(last)).getTime();
    if (!force && reason === "edit" && age < AUTO_GAP_MS) return null;
  }
  await fs.mkdir(dir, { recursive: true });
  const id = `${stamp()}--${reason}.json`;
  await fs.writeFile(path.join(dir, id), body);
  if (entries.length + 1 > KEEP_PER_FILE) {
    for (const old of entries.slice(0, entries.length + 1 - KEEP_PER_FILE)) await fs.rm(path.join(dir, old), { force: true });
  }
  return id;
}

export async function listSnapshots(name: string): Promise<Snapshot[]> {
  const entries = await listDir(dirFor(name));
  return entries
    .map((id) => ({ id, file: name, at: fromStamp(id), reason: id.replace(/^.*--(.+)\.json$/, "$1") }))
    .reverse();
}

export async function readSnapshot(name: string, id: string) {
  if (!/^[\w.-]+\.json$/.test(id)) throw new Error("Bad version id");
  return readJson<unknown>(path.join(dirFor(name), id));
}

/** Puts an earlier copy back, keeping the current one first so it can be undone too. */
export async function restoreSnapshot(name: string, id: string) {
  const data = await readSnapshot(name, id);
  await snapshot(name, "before-restore", { force: true });
  await writeJson(contentFile(name), data);
  return data;
}

/** Pages that were deleted: their last copy before deletion. */
export async function deletedPages() {
  const root = path.join(HISTORY, "files");
  if (!(await exists(root))) return [];
  const out: { id: string; snapshot: string; at: string; title: string }[] = [];
  for (const dir of await fs.readdir(root)) {
    if (!dir.startsWith("pages__")) continue;
    const pageId = dir.slice(7);
    if (await exists(path.join(CONTENT, "pages", `${pageId}.json`))) continue;
    const entries = await listDir(path.join(root, dir));
    const last = entries.at(-1);
    if (!last) continue;
    const data = await readJson<{ root?: { props?: { title?: string } } }>(path.join(root, dir, last));
    out.push({ id: pageId, snapshot: last, at: fromStamp(last), title: data.root?.props?.title ?? pageId });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

// ------------------------------------------------------------ named versions

const VERSIONS = path.join(HISTORY, "versions");

export async function saveVersion(label: string): Promise<Version> {
  const id = `${stamp()}`;
  const dir = path.join(VERSIONS, id);
  await fs.mkdir(path.join(dir, "pages"), { recursive: true });
  const names = await contentNames();
  for (const name of names) await fs.copyFile(contentFile(name), path.join(dir, `${name}.json`));
  await writeJson(path.join(dir, "version.json"), { label: label.slice(0, 120) || "Saved version", at: new Date().toISOString() });
  return { id, at: new Date().toISOString(), label, files: names.length };
}

export async function listVersions(): Promise<Version[]> {
  if (!(await exists(VERSIONS))) return [];
  const ids = (await fs.readdir(VERSIONS)).sort().reverse();
  const out: Version[] = [];
  for (const id of ids) {
    const info = await readJson<{ label: string; at: string }>(path.join(VERSIONS, id, "version.json")).catch(() => null);
    if (!info) continue;
    const pages = await fs.readdir(path.join(VERSIONS, id, "pages")).catch(() => []);
    out.push({ id, at: info.at, label: info.label, files: pages.length + 3 });
  }
  return out;
}

/** Puts the whole site back as it was in a saved version (saving today's first). */
export async function restoreVersion(id: string) {
  if (!/^[\w-]+$/.test(id)) throw new Error("Bad version id");
  const dir = path.join(VERSIONS, id);
  await saveVersion("Before going back to an earlier version");
  const pages = (await fs.readdir(path.join(dir, "pages"))).filter((f) => f.endsWith(".json"));
  const current = await contentNames();
  for (const name of current.filter((n) => n.startsWith("pages/"))) {
    if (!pages.includes(`${name.slice(6)}.json`)) {
      await snapshot(name, "deleted", { force: true });
      await fs.rm(contentFile(name), { force: true });
    }
  }
  for (const name of ["site", "collections", "media", ...pages.map((p) => `pages/${p.replace(/\.json$/, "")}`)]) {
    const src = path.join(dir, `${name}.json`);
    if (await exists(src)) await writeJson(contentFile(name), await readJson(src));
  }
}
