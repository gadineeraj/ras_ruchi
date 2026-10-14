import type { NextConfig } from "next";

// Two ways to build the site:
// - Locally (`npm run build && npm start`): a Next.js server with image
//   optimisation and Cache Components.
// - On GitHub Pages (GITHUB_PAGES=true, set by .github/workflows/deploy.yml): a
//   static export of plain HTML, CSS, JS and images. PAGES_BASE_PATH is the
//   sub-path GitHub serves the site from, e.g. "/ras_ruchi" for
//   username.github.io/ras_ruchi.
const githubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = githubPages
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      // GitHub Pages has no image server; the WebP files are already sized.
      images: { unoptimized: true },
      env: { NEXT_PUBLIC_BASE_PATH: basePath },
    }
  : {
      cacheComponents: true,
      partialPrefetching: true,
      images: {
        // Next 16 requires an explicit allowlist of qualities.
        qualities: [72, 82],
        formats: ["image/avif", "image/webp"],
      },
    };

export default nextConfig;
