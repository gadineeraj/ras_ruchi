// Readies a saved page for the published site:
// - fills in any setting a block gained after the page was saved, so a block
//   never renders with a missing value;
// - leaves out blocks she hid, and any block type the site no longer has;
// - gives links inside rich text the sub-path the site is served from.
import type { Config } from "@puckeditor/core";
import type { PageData } from "./content-types";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Item = { type: string; props: Record<string, unknown> & { id?: string } };
type FieldDef = { type: string; arrayFields?: Record<string, FieldDef>; objectFields?: Record<string, FieldDef> };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function prefixLinks(html: string): string {
  if (!BASE_PATH || typeof html !== "string") return html;
  return html.replace(/href="\/(?!\/)/g, `href="${BASE_PATH}/`);
}

function prepareItems(items: unknown, config: Config, keepHidden: boolean): Item[] {
  if (!Array.isArray(items)) return [];
  const out: Item[] = [];
  for (const raw of items as Item[]) {
    const def = config.components[raw?.type] as { defaultProps?: Record<string, unknown>; fields?: Record<string, FieldDef> } | undefined;
    if (!def) continue;
    const defaults = def.defaultProps ?? {};
    const props: Record<string, unknown> = { ...defaults, ...raw.props };
    if (isPlainObject(defaults.layout)) props.layout = { ...defaults.layout, ...(isPlainObject(raw.props.layout) ? raw.props.layout : {}) };
    if (!keepHidden && isPlainObject(props.layout) && props.layout.hidden) continue;
    for (const [name, field] of Object.entries(def.fields ?? {})) {
      if (field.type === "slot") props[name] = prepareItems(props[name], config, keepHidden);
      if (field.type === "richtext" && typeof props[name] === "string") props[name] = prefixLinks(props[name] as string);
    }
    out.push({ type: raw.type, props });
  }
  return out;
}

export function preparePage(data: PageData, config: Config, { keepHidden = false } = {}): PageData {
  const rootDefaults = (config.root?.defaultProps ?? {}) as Record<string, unknown>;
  return {
    root: { ...data.root, props: { ...rootDefaults, ...data.root.props } as PageData["root"]["props"] },
    content: prepareItems(data.content, config, keepHidden) as PageData["content"],
    zones: {},
  };
}
