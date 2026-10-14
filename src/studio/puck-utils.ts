// Small helpers for moving, adding and finding blocks in the open page.
import type { PageData } from "@/lib/content-types";
import { freshIds } from "./state";

export const ROOT_ZONE = "root:default-zone";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- block props vary by block
type Item = { type: string; props: Record<string, any> };
type Api = {
  dispatch: (a: Record<string, unknown>) => void;
  appState: { data: PageData; ui: Record<string, unknown> };
  getSelectorForId: (id: string) => { index: number; zone: string } | undefined;
};

function findById(items: unknown, id: string): Item | null {
  if (!Array.isArray(items)) return null;
  for (const it of items as Item[]) {
    if (it?.props?.id === id) return it;
    for (const v of Object.values(it?.props ?? {})) {
      const hit = Array.isArray(v) ? findById(v, id) : null;
      if (hit) return hit;
    }
  }
  return null;
}

/** The blocks in a zone: the page itself, or a section's / column's slot. */
export function zoneItems(data: PageData, zone: string): Item[] {
  if (zone === ROOT_ZONE) return data.content as Item[];
  const at = zone.indexOf(":");
  const parent = findById(data.content, zone.slice(0, at));
  const value = parent?.props?.[zone.slice(at + 1)];
  return Array.isArray(value) ? value : [];
}

/** Where a new block goes: after the selected one, else at the end of the page. */
export function insertTarget(api: Api): { zone: string; index: number } {
  const sel = api.appState.ui.itemSelector as { index: number; zone?: string } | null;
  if (sel?.zone) return { zone: sel.zone, index: sel.index + 1 };
  return { zone: ROOT_ZONE, index: api.appState.data.content.length };
}

/** Selects a block and brings it into view in the canvas. */
export function selectAndReveal(api: Api, id: string, deal = false) {
  const sel = api.getSelectorForId(id);
  if (sel) api.dispatch({ type: "setUi", ui: { itemSelector: sel } });
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const frame = document.querySelector<HTMLIFrameElement>("#preview-frame");
      const el = frame?.contentDocument?.querySelector<HTMLElement>(`[data-puck-component="${id}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (deal && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.animate(
          [
            { opacity: 0, translate: "0 -26px", rotate: "-0.6deg" },
            { opacity: 1, translate: "0 0", rotate: "0deg" },
          ],
          { duration: 720, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        );
      }
    }),
  );
}

/** Adds a block, or a whole ready-made section, and selects it. */
export function insertTree(api: Api, tree: Item, target: { zone: string; index: number }) {
  const fresh = freshIds(tree);
  api.dispatch({ type: "insert", componentType: fresh.type, destinationZone: target.zone, destinationIndex: target.index, id: fresh.props.id });
  api.dispatch({ type: "replace", destinationZone: target.zone, destinationIndex: target.index, data: fresh });
  selectAndReveal(api, fresh.props.id, true);
  return fresh.props.id as string;
}

/** Moves the selected block up or down within its zone. */
export function moveSelected(api: Api, by: -1 | 1) {
  const sel = api.appState.ui.itemSelector as { index: number; zone?: string } | null;
  if (!sel?.zone) return false;
  const items = zoneItems(api.appState.data, sel.zone);
  const to = sel.index + by;
  if (to < 0 || to >= items.length) return false;
  api.dispatch({ type: "reorder", sourceIndex: sel.index, destinationIndex: to, destinationZone: sel.zone });
  api.dispatch({ type: "setUi", ui: { itemSelector: { index: to, zone: sel.zone } } });
  return true;
}
