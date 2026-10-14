// Checks before publishing: things a visitor would notice (a link that goes
// nowhere, a missing swatch) and things that help (photo descriptions).
import type { Content } from "./api";
import { normalisePath } from "@/lib/paths";

export type Issue = {
  level: "fix" | "improve";
  message: string;
  pageId?: string;
  blockId?: string;
  where: string;
};

type Node = Record<string, unknown>;

function walk(node: unknown, visit: (obj: Node, block: Node | null) => void, block: Node | null = null) {
  if (Array.isArray(node)) node.forEach((n) => walk(n, visit, block));
  else if (node && typeof node === "object") {
    const o = node as Node;
    const isBlock = typeof o.type === "string" && o.props && typeof o.props === "object";
    const owner = isBlock ? o : block;
    visit(o, owner);
    Object.values(o).forEach((v) => walk(v, visit, owner));
  }
}

const isPhoto = (o: Node) => typeof o.src === "string" && typeof o.width === "number" && typeof o.height === "number" && typeof o.blur === "string";

export function runChecks(content: Content): Issue[] {
  const issues: Issue[] = [];
  const pages = Object.entries(content.pages);
  const live = pages.filter(([, p]) => !p.root.props.draft);
  const paths = new Map<string, string[]>();
  for (const [id, p] of pages) {
    const path = normalisePath(p.root.props.path);
    paths.set(path, [...(paths.get(path) ?? []), id]);
  }
  const livePaths = new Set(live.map(([, p]) => normalisePath(p.root.props.path)));

  for (const [path, ids] of paths) {
    if (ids.length > 1) issues.push({ level: "fix", message: `${ids.length} pages share the address ${path}. Give each its own in Page settings.`, pageId: ids[1], where: content.pages[ids[1]].root.props.title });
  }

  for (const [id, page] of live) {
    const title = page.root.props.title;
    const seenPhotos = new Set<string>();
    walk(page.content, (o, block) => {
      const blockId = (block?.props as Node | undefined)?.id as string | undefined;
      // These blocks describe their photos from the block's own title when a photo has none.
      const describedByBlock = (block?.type === "StudyImages" || block?.type === "Gallery") && Boolean((block.props as Node).title);
      const coverWithTitle = block?.type === "StudyHeader" && o === (block.props as Node).cover;
      if (isPhoto(o) && !o.alt && !o.decorative && !describedByBlock && !coverWithTitle && !seenPhotos.has(o.src as string)) {
        seenPhotos.add(o.src as string);
        issues.push({ level: "improve", message: "A photo has no description for people using screen readers.", pageId: id, blockId, where: title });
      }
      if (typeof o.href === "string" && o.href.startsWith("/") && !o.href.startsWith("//")) {
        const target = normalisePath(o.href.split("#")[0]);
        if (!livePaths.has(target)) issues.push({ level: "fix", message: `A link goes to ${o.href}, which isn't a published page.`, pageId: id, blockId, where: title });
      }
    });
    for (const block of page.content as Node[]) {
      walk(block, (o) => {
        const props = o.props as Node | undefined;
        if (!props || typeof o.type !== "string") return;
        const empty =
          (o.type === "Gallery" && !(props.items as unknown[] | undefined)?.length) ||
          (o.type === "StudyImages" && !(props.photos as unknown[] | undefined)?.length) ||
          (o.type === "Swatches" && !(props.picks as unknown[] | undefined)?.length) ||
          (o.type === "Image" && !(props.photo as Node | null)?.src) ||
          (o.type === "Video" && !props.url);
        if (empty && !(props.layout as Node | undefined)?.hidden) issues.push({ level: "fix", message: `An empty ${String(o.type) === "Image" ? "photo" : String(o.type).toLowerCase()} block will show a blank space.`, pageId: id, blockId: props.id as string, where: title });
      });
    }
    if (!page.root.props.description && page.root.props.path !== "/not-found") {
      issues.push({ level: "improve", message: "No search description. Google will pick some words from the page itself.", pageId: id, where: title });
    }
  }

  for (const n of content.site.nav) {
    if (n.href.startsWith("/") && !livePaths.has(normalisePath(n.href.split("#")[0]))) {
      issues.push({ level: "fix", message: `The menu links to ${n.href}, which isn't a published page.`, where: "Site settings, menu" });
    }
  }

  for (const c of content.collections) {
    for (const d of c.designs) {
      for (const cw of d.colourways) {
        if (!cw.chip?.src || !cw.swatch?.src) issues.push({ level: "fix", message: `${d.name} in ${cw.name} has no swatch yet, so it won't show.`, where: `Collections, ${c.name}` });
      }
    }
  }

  if (!content.site.email || /xyz@/.test(content.site.email)) issues.push({ level: "improve", message: "The contact email is still a placeholder.", where: "Site settings" });

  return issues;
}
