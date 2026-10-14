// Serves the built site in out/ at http://localhost:3300, exactly as GitHub
// Pages will: plain files, folders as index.html, and 404.html for anything
// missing. Run `npm run build` first, then `npm run preview`.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../out");
const PORT = Number(process.env.PORT ?? 3300);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain",
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const file = path.join(ROOT, clean);
  if (!file.startsWith(ROOT)) return null;
  for (const candidate of [file, path.join(file, "index.html"), `${file}.html`]) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {}
  }
  return null;
}

http
  .createServer((req, res) => {
    const url = req.url ?? "/";
    // Folders get a trailing slash, as on GitHub Pages.
    if (!url.split("?")[0].endsWith("/") && !path.extname(url.split("?")[0]) && resolve(url + "/")) {
      res.writeHead(301, { Location: url.split("?")[0] + "/" });
      return res.end();
    }
    const file = resolve(url);
    const found = file ?? path.join(ROOT, "404.html");
    res.writeHead(file ? 200 : 404, { "Content-Type": TYPES[path.extname(found)] ?? "application/octet-stream" });
    fs.createReadStream(found).pipe(res);
  })
  .listen(PORT, () => console.log(`The built site is at http://localhost:${PORT}/`));
