// Fills github-repo/ with exactly the files the GitHub repository needs, and
// nothing else. Run with: npm run github
//
// The folder is emptied first (except its .git link, if it has one), so a
// commit of github-repo always matches the current site: changed files are
// replaced and files that no longer exist are removed.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = path.resolve(ROOT, process.argv[2] ?? "github-repo");

// Everything needed to build the site. The image download script and its
// 45 MB of source data stay in the main project; the repo only needs the
// finished images in public/.
const SOURCES = ["src", "public", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "eslint.config.mjs"];
// Files that exist only in the repo: the publishing workflow, .gitignore, README.
const TEMPLATE = path.join(ROOT, "deploy/github");
const SKIP = new Set([".DS_Store"]);

const filter = (src) => !SKIP.has(path.basename(src));

await fs.mkdir(TARGET, { recursive: true });
for (const entry of await fs.readdir(TARGET)) {
  if (entry !== ".git") await fs.rm(path.join(TARGET, entry), { recursive: true, force: true });
}

for (const item of SOURCES) {
  await fs.cp(path.join(ROOT, item), path.join(TARGET, item), { recursive: true, filter });
}
await fs.cp(TEMPLATE, TARGET, { recursive: true, filter });

async function count(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await count(p);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += (await fs.stat(p)).size;
    }
  }
  return { files, bytes };
}

const { files, bytes } = await count(TARGET);
const linked = await fs
  .stat(path.join(TARGET, ".git"))
  .then(() => true)
  .catch(() => false);
console.log(`github-repo ready: ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`  ${TARGET}`);
console.log(linked ? "  Linked to git: commit and push it in GitHub Desktop." : "  Not linked to git yet: see GITHUB_HOSTING.md, step 3.");
