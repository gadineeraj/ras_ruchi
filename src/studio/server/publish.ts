// Publishing. The site goes live when this folder is pushed to GitHub (GitHub
// Desktop does the pushing). The Studio remembers what the content looked like
// at the last publish, so it can list what changed since and put it back.
import { execFile, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { CONTENT, PUBLISHED, ROOT, STUDIO_DIR, contentFile, contentNames, exists, readJson, sha1, writeJson } from "./files";
import { snapshot } from "./history";

type Record_ = { at: string; files: Record<string, string> };
const RECORD = path.join(STUDIO_DIR, "published.json");

async function hashes() {
  const out: Record<string, string> = {};
  for (const name of await contentNames()) out[name] = sha1(await fs.readFile(contentFile(name)));
  return out;
}

async function remember() {
  const files = await hashes();
  await fs.rm(PUBLISHED, { recursive: true, force: true });
  await fs.cp(CONTENT, path.join(PUBLISHED, "content"), { recursive: true });
  const record = { at: new Date().toISOString(), files };
  await writeJson(RECORD, record);
  return record;
}

/** The first time the Studio runs, today's content counts as published. */
async function record(): Promise<Record_> {
  if (await exists(RECORD)) return readJson<Record_>(RECORD);
  return remember();
}

export type Change = { file: string; title: string; change: "new" | "changed" | "removed" };

export async function changes() {
  const rec = await record();
  const now = await hashes();
  const out: Change[] = [];
  const title = async (name: string, from: "now" | "then") => {
    if (name === "site") return "Site settings";
    if (name === "collections") return "Collections library";
    if (name === "media") return "Photo library";
    const file = from === "now" ? contentFile(name) : path.join(PUBLISHED, "content", `${name}.json`);
    const data = await readJson<{ root?: { props?: { title?: string } } }>(file).catch(() => null);
    return data?.root?.props?.title ?? name.replace("pages/", "");
  };
  for (const [name, hash] of Object.entries(now)) {
    if (!(name in rec.files)) out.push({ file: name, title: await title(name, "now"), change: "new" });
    else if (rec.files[name] !== hash) out.push({ file: name, title: await title(name, "now"), change: "changed" });
  }
  for (const name of Object.keys(rec.files)) if (!(name in now)) out.push({ file: name, title: await title(name, "then"), change: "removed" });
  return { publishedAt: rec.at, changes: out };
}

const DESKTOP = "/Applications/GitHub Desktop.app";

export async function githubDesktop() {
  return { installed: await exists(DESKTOP), repo: await exists(path.join(ROOT, ".git")) };
}

/** Marks today's content as published and opens GitHub Desktop on this folder. */
export async function publish() {
  const before = await changes();
  await remember();
  const desktop = await githubDesktop();
  if (desktop.installed && process.platform === "darwin") {
    await new Promise<void>((resolve) => execFile("open", ["-a", "GitHub Desktop", ROOT], () => resolve()));
  }
  return { ...desktop, published: before.changes.length };
}

/** Puts every page back the way it was at the last publish. */
export async function discard() {
  await record();
  const saved = path.join(PUBLISHED, "content");
  for (const name of await contentNames()) await snapshot(name, "before-discard", { force: true });
  const keep = new Set((await fs.readdir(path.join(saved, "pages"))).filter((f) => f.endsWith(".json")));
  for (const f of await fs.readdir(path.join(CONTENT, "pages"))) if (f.endsWith(".json") && !keep.has(f)) await fs.rm(path.join(CONTENT, "pages", f));
  await fs.cp(saved, CONTENT, { recursive: true });
}

// --------------------------------------------------------------- preview

type PreviewState = { status: "idle" | "building" | "ready" | "failed"; log: string; url: string; startedAt?: string };
const g = globalThis as unknown as { __studioPreview?: PreviewState & { server?: ChildProcess } };
g.__studioPreview ??= { status: "idle", log: "", url: "http://localhost:3300/" };

export function previewState(): PreviewState {
  const { server: _s, ...state } = g.__studioPreview!;
  return { ...state, log: state.log.slice(-4000) };
}

/** Builds the site exactly as GitHub will, then serves it at localhost:3300. */
export function buildPreview() {
  const st = g.__studioPreview!;
  if (st.status === "building") return previewState();
  st.status = "building";
  st.log = "";
  st.startedAt = new Date().toISOString();
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production", PAGES_BASE_PATH: "", NEXT_TELEMETRY_DISABLED: "1" };
  const child = spawn(process.execPath, [path.join(ROOT, "node_modules/next/dist/bin/next"), "build"], { cwd: ROOT, env });
  child.stdout?.on("data", (d: Buffer) => (st.log += d.toString()));
  child.stderr?.on("data", (d: Buffer) => (st.log += d.toString()));
  child.on("close", (code) => {
    if (code !== 0) {
      st.status = "failed";
      return;
    }
    if (!st.server || st.server.exitCode !== null) {
      st.server = spawn(process.execPath, [path.join(ROOT, "scripts/preview.mjs")], { cwd: ROOT, env: { ...process.env, PORT: "3300" }, stdio: "ignore" });
    }
    st.status = "ready";
  });
  return previewState();
}
