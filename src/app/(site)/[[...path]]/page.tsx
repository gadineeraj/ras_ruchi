import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { config } from "@/blocks/config";
import { findPage, metaFor, publishedPages, readSite } from "@/lib/content-server";
import { asset, normalisePath } from "@/lib/paths";
import { preparePage } from "@/lib/render-data";

// Every page of the site comes from content/pages/*.json, written by the Studio.
export const dynamicParams = false;

const SPECIAL = new Set(["not-found"]);

export async function generateStaticParams() {
  return (await publishedPages())
    .filter((p) => !SPECIAL.has(p.id))
    .map((p) => ({ path: normalisePath(p.data.root.props.path).split("/").filter(Boolean) }));
}

const toPath = (segments?: string[]) => "/" + (segments ?? []).map(decodeURIComponent).join("/");

export async function generateMetadata({ params }: PageProps<"/[[...path]]">): Promise<Metadata> {
  const page = await findPage(toPath((await params).path));
  if (!page) return {};
  const site = await readSite();
  const root = page.data.root.props;
  const share = root.shareImage ?? site.shareImage;
  const isHome = normalisePath(root.path) === "/";
  // The home page leaves the title out, so the site's own title stands.
  return {
    ...(isHome ? {} : { title: root.title }),
    description: root.description || site.description,
    openGraph: share ? { images: [{ url: asset(share.src), width: share.width, height: share.height }] } : undefined,
  };
}

export default async function SitePage({ params }: PageProps<"/[[...path]]">) {
  const page = await findPage(toPath((await params).path));
  if (!page || SPECIAL.has(page.id)) notFound();
  const meta = await metaFor(page);
  return <Render config={config} data={preparePage(page.data, config)} metadata={meta as unknown as Record<string, unknown>} />;
}
