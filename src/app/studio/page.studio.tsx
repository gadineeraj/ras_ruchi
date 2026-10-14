import type { Metadata } from "next";
import { Studio } from "@/studio/Studio";
import { readAllContent } from "@/studio/server/content";

// The Studio exists only on her laptop (`npm run studio`); the published site
// is built without it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [content, params] = await Promise.all([readAllContent(), searchParams]);
  const want = typeof params.page === "string" ? params.page : "home";
  // The server and the browser must agree on the open page, or React redraws it.
  return <Studio initial={content} initialPage={content.pages[want] ? want : "home"} />;
}
