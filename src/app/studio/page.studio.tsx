import type { Metadata } from "next";
import { Studio } from "@/studio/Studio";
import { readAllContent } from "@/studio/server/content";

// The Studio exists only on her laptop (`npm run studio`); the published site
// is built without it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

export default async function StudioPage() {
  return <Studio initial={await readAllContent()} />;
}
