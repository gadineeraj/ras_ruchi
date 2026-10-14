import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Two ways the project runs:
// - `npm run studio` (Next's development server): the site plus the Studio at
//   /studio and its save API. Files named *.studio.tsx / *.studio.ts exist
//   only here.
// - `npm run build`: a static export of plain HTML, CSS, JS and images in
//   out/, exactly what GitHub Pages serves. The Studio is not part of it.
//   PAGES_BASE_PATH is the sub-path GitHub serves from, e.g. "/ras_ruchi".
const basePath = process.env.PAGES_BASE_PATH ?? "";

export default function config(phase: string): NextConfig {
  const studio = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    pageExtensions: studio ? ["tsx", "ts", "studio.tsx", "studio.ts"] : ["tsx", "ts"],
    ...(studio ? {} : { output: "export" as const, basePath }),
    trailingSlash: true,
    // Photos are already sized WebP files; there is no image server on GitHub Pages.
    images: { unoptimized: true, qualities: [72, 82, 88] },
    env: { NEXT_PUBLIC_BASE_PATH: studio ? "" : basePath },
    devIndicators: false,
  };
}
