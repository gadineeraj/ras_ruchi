// Pure helpers over pages, shared by the site build and the Studio.
import type { Page, PageData, SiteMeta, StudySummary } from "./content-types";
import { normalisePath } from "./paths";

/** Pages in the order set in the Studio's Pages panel; unlisted ones after. */
export function orderPages(pages: Page[], order: string[]): Page[] {
  const at = new Map(order.map((id, i) => [id, i]));
  return [...pages].sort((a, b) => (at.get(a.id) ?? 1e6) - (at.get(b.id) ?? 1e6) || a.id.localeCompare(b.id));
}

type Node = { type: string; props: Record<string, unknown> };

/** Every block on a page, nested ones included. */
export function allBlocks(data: PageData): Node[] {
  const out: Node[] = [];
  const visit = (items: unknown) => {
    if (!Array.isArray(items)) return;
    for (const item of items as Node[]) {
      if (!item || typeof item !== "object" || !("type" in item)) continue;
      out.push(item);
      for (const value of Object.values(item.props ?? {})) {
        if (Array.isArray(value) && value.some((v) => v && typeof v === "object" && "type" in v && "props" in v)) visit(value);
      }
    }
  };
  visit(data.content);
  return out;
}

/** What the studies index shows, read from each study page's header block. */
export function studySummaries(pages: Page[], includeDrafts = false): StudySummary[] {
  return pages
    .filter((p) => p.data.root.props.kind === "study" && (includeDrafts || !p.data.root.props.draft))
    .map((p) => {
      const header = allBlocks(p.data).find((b) => b.type === "StudyHeader")?.props ?? {};
      return {
        id: p.id,
        path: normalisePath(p.data.root.props.path),
        title: typeof header.title === "string" ? header.title : p.data.root.props.title,
        hook: typeof header.hook === "string" ? header.hook : "",
        credits: (header.credits as StudySummary["credits"]) ?? [],
        cover: (header.cover as StudySummary["cover"]) ?? null,
      };
    });
}

export function pageIndex(pages: Page[]): SiteMeta["pages"] {
  return pages.map((p) => ({ id: p.id, title: p.data.root.props.title, path: normalisePath(p.data.root.props.path), kind: p.data.root.props.kind, draft: p.data.root.props.draft }));
}
