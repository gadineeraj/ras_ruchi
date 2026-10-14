// On GitHub Pages the site lives under a sub-path (e.g. /ras_ruchi). Links get
// it from Next.js automatically; image and file sources get it here.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(src: string): string {
  if (!src || !src.startsWith("/") || src.startsWith("//")) return src;
  return BASE_PATH && !src.startsWith(`${BASE_PATH}/`) ? `${BASE_PATH}${src}` : src;
}

/** "/practice" from "practice", "/" from "". */
export function normalisePath(path: string): string {
  const clean = "/" + path.trim().replace(/^\/+|\/+$/g, "");
  return clean === "/" ? "/" : clean.toLowerCase();
}
