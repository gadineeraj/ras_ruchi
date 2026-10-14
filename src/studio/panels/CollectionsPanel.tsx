"use client";

// The Collections panel: the library behind her shade cards, in three levels
// inside one panel. First the collections, in the order the site shows their
// cards; then one collection with its details and designs; then one design
// with its colourways, where she picks the photos and cuts each swatch.
/* eslint-disable @next/next/no-img-element -- Studio thumbnails are plain images of local files. */
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { ScissorsIcon } from "@phosphor-icons/react/dist/ssr/Scissors";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { BackLink, CollectionCard, CollectionPager } from "@/blocks/portfolio";
import type { BlockData, Collection, Colourway, Design, Img, PageData, PageRoot, Photo, SiteSettings } from "@/lib/content-types";
import { isComplete, slugify } from "@/lib/library";
import { asset, normalisePath } from "@/lib/paths";
import { api } from "../api";
import { useStudio } from "../state";
import { Button, Dialog, Empty, Field, IconButton, PanelHead, Section, Select, Spinner, TextArea, TextInput, ui } from "../ui";
import css from "./library.module.css";

/** The product types a photo can show. Keys of the captions in src/lib/format.ts. */
const PRODUCT_TYPES = ["Blind", "Standard Curtains", "Combo Curtains", "Cushion Covers", "Combo Cushion Covers", "Printed Fabric", "Table Runner", "Table Cloth"];

const NEW_BAND = "#6a2222";

// A colourway is saved before she has chosen its photos. The site skips it
// (see isComplete in src/lib/library.ts) until it has a close-up and a swatch.
const NO_PHOTO = null as unknown as Img;
const NO_CHIP = null as unknown as Colourway["chip"];

// ----------------------------------------------------------------- helpers

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A slug from a name, with -2, -3… added when it is taken. */
function uniqueSlug(name: string, taken: string[], fallback: string) {
  const root = slugify(name) || fallback;
  const set = new Set(taken);
  let slug = root;
  for (let n = 2; set.has(slug); n++) slug = `${root}-${n}`;
  return slug;
}

/** True while a slug is still the one made from a name (with or without a -2 style ending). */
function madeFrom(slug: string, name: string) {
  const base = slugify(name);
  return Boolean(base) && (slug === base || (slug.startsWith(`${base}-`) && /^\d+$/.test(slug.slice(base.length + 1))));
}

function moved<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** The fields a colourway keeps from a chosen photo. */
function imgOf(p: Photo | Img): Img {
  const img: Img = { src: p.src, width: p.width, height: p.height, blur: p.blur ?? "", color: p.color ?? "" };
  if (p.animated) img.animated = true;
  return img;
}

const hasShowable = (d: Design) => (d.colourways ?? []).some(isComplete);
const validHex = (hex: string) => (/^#[0-9a-f]{6}$/i.test(hex ?? "") ? hex : NEW_BAND);

/** Moves keyboard focus to the first of these buttons that can take it, after React has re-drawn. */
function refocus(...keys: string[]) {
  requestAnimationFrame(() => {
    for (const key of keys) {
      const el = document.querySelector<HTMLButtonElement>(`[data-focus-key="${CSS.escape(key)}"]`);
      if (el && !el.disabled) {
        el.focus();
        return;
      }
    }
  });
}

// ------------------------------------------------- keeping links pointed right

type Rewrite = (key: string, value: string) => string;

/** A copy of the tree with strings swapped by `fn`; the same object when nothing changed. */
function rewrite<T>(node: T, fn: Rewrite): T {
  if (Array.isArray(node)) {
    let changed = false;
    const out = node.map((n) => {
      const v = rewrite(n, fn);
      if (v !== n) changed = true;
      return v;
    });
    return (changed ? out : node) as T;
  }
  if (node && typeof node === "object") {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const next = typeof v === "string" ? fn(k, v) : v && typeof v === "object" ? rewrite(v, fn) : v;
      if (next !== v) changed = true;
      out[k] = next;
    }
    return (changed ? out : node) as T;
  }
  return node;
}

const isRef = (key: string) => key === "pick" || key === "design";

/** A collection's slug changed: its page, its blocks, swatch picks and links follow. */
const collectionRefs =
  (from: string, to: string): Rewrite =>
  (key, v) => {
    if (key === "collection" && v === from) return to;
    if (isRef(key) && (v === from || v.startsWith(`${from}/`))) return to + v.slice(from.length);
    const path = `/collections/${from}`;
    if ((key === "path" || key === "href") && (v === path || v === `${path}/` || v.startsWith(`${path}#`))) return `/collections/${to}${v.slice(path.length)}`;
    return v;
  };

/** A design's slug changed: swatch picks of it follow. */
const designRefs =
  (collection: string, from: string, to: string): Rewrite =>
  (key, v) => {
    const old = `${collection}/${from}`;
    if (isRef(key) && (v === old || v.startsWith(`${old}/`))) return `${collection}/${to}${v.slice(old.length)}`;
    return v;
  };

/** A colourway's id changed: swatch picks of it follow. */
const colourwayRefs =
  (collection: string, design: string, from: string, to: string): Rewrite =>
  (key, v) =>
    key === "pick" && v === `${collection}/${design}/${from}` ? `${collection}/${design}/${to}` : v;

// ---------------------------------------------------------- shared actions

function useLibrary() {
  const studio = useStudio();
  const { content, setCollections, setPageData, setSite, puck, currentId, pageList, createPage, openPage } = studio;
  const latest = useRef(content);
  useEffect(() => {
    latest.current = content;
  });

  const updateCollection = (ci: number, fn: (c: Collection) => Collection) => setCollections((cs) => cs.map((c, i) => (i === ci ? fn(c) : c)));
  const updateDesign = (ci: number, di: number, fn: (d: Design) => Design) => updateCollection(ci, (c) => ({ ...c, designs: c.designs.map((d, j) => (j === di ? fn(d) : d)) }));
  const updateColourway = (ci: number, di: number, ki: number, fn: (k: Colourway) => Colourway) =>
    updateDesign(ci, di, (d) => ({ ...d, colourways: d.colourways.map((k, j) => (j === ki ? fn(k) : k)) }));

  /**
   * Points every page, and the site menu, at a renamed collection, design or
   * colourway. A change to one page's settings can ride along in the same pass,
   * so the two never overwrite each other.
   */
  const rewritePages = (fn: Rewrite, root?: { id: string; patch: Partial<PageRoot> }) => {
    const change = (id: string, data: PageData) => {
      const next = rewrite(data, fn);
      return root?.id === id ? { ...next, root: { ...next.root, props: { ...next.root.props, ...root.patch } } } : next;
    };
    for (const [id, page] of Object.entries(latest.current.pages)) {
      const editor = id === currentId ? puck.current : null;
      if (editor) {
        const data = editor().appState.data;
        const next = change(id, data);
        if (next !== data) editor().dispatch({ type: "setData", data: next });
      } else {
        const next = change(id, page);
        if (next !== page) setPageData(id, next);
      }
    }
    const site = latest.current.site;
    if (rewrite(site, fn) !== site) setSite((s) => rewrite<SiteSettings>(s, fn));
  };

  /** The page that shows a collection, if it has one. */
  const pageFor = (slug: string) => pageList.find((p) => p.kind === "collection" && content.pages[p.id]?.root.props.collection === slug) ?? null;

  /** Is /collections/<slug> free for this collection's page? */
  const pathFree = (slug: string, ownPage?: string | null) => Object.entries(content.pages).every(([id, p]) => id === ownPage || normalisePath(p.root.props.path ?? "") !== `/collections/${slug}`);

  // A new page reaches the shared state a moment after it is made; open it then.
  const openWhenReady = async (id: string) => {
    for (let i = 0; i < 60 && !latest.current.pages[id]; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
    openPage(id);
  };

  /** Makes a collection's page: a back link, the collection card and the pager, then opens it. */
  const makePage = async (c: Collection) => {
    const block = (type: string, defaults: Record<string, unknown>, extra: Record<string, unknown> = {}): BlockData => ({ type, props: { ...structuredClone(defaults), ...extra, id: `${type}-new` } });
    const blocks: PageData["content"] = [
      block("BackLink", BackLink.defaultProps),
      block("CollectionCard", CollectionCard.defaultProps, { collection: c.slug }),
      block("CollectionPager", CollectionPager.defaultProps, { collection: c.slug }),
    ];
    const id = await createPage({ title: c.name, kind: "collection", collection: c.slug, path: `/collections/${c.slug}`, content: blocks });
    await openWhenReady(id);
    return id;
  };

  return { ...studio, updateCollection, updateDesign, updateColourway, rewritePages, pageFor, pathFree, makePage };
}

// ------------------------------------------------------------------- panel

type View = { c: number; d?: number } | null;

// Where she was, kept when the editor re-opens the panel (e.g. after opening a page).
let remembered: View = null;

export function CollectionsPanel() {
  const lib = useLibrary();
  const { content, setCollections, toast } = lib;
  const collections = content.collections ?? [];
  const [view, setViewState] = useState<View>(() => remembered);

  const c = view ? collections[view.c] : undefined;
  const d = c && view?.d !== undefined ? c.designs[view.d] : undefined;
  const level = !view || !c ? 1 : !d ? 2 : 3;

  const go = (next: View, focusKey?: string) => {
    remembered = next;
    setViewState(next);
    refocus(...(focusKey ? [focusKey] : []), "cl-back");
  };

  const addCollection = async () => {
    const slug = uniqueSlug("New collection", collections.map((x) => x.slug), "collection");
    const fresh: Collection = { slug, name: "New collection", season: "", band: NEW_BAND, line: "", intro: "", designs: [] };
    setCollections((cs) => [...cs, fresh]);
    go({ c: collections.length });
    try {
      await lib.makePage(fresh);
      toast("New collection added, with its own page. The page stays a draft until you switch that off.", { tone: "success" });
    } catch (e) {
      toast(`The collection was added, but its page couldn't be made. ${(e as Error).message}`, { tone: "error" });
    }
  };

  let title: ReactNode = "Collections";
  let back: ReactNode = undefined;
  if (view && c) {
    const up = level === 3 ? () => go({ c: view.c }, `cl-design-${view.d}`) : () => go(null, `cl-collection-${view.c}`);
    back = <IconButton data-focus-key="cl-back" label={level === 3 ? `Back to ${c.name}` : "Back to all collections"} icon={<ArrowLeftIcon size={18} />} onClick={up} />;
    title = (
      <span className={css.crumbs}>
        <button type="button" onClick={() => go(null, `cl-collection-${view.c}`)}>
          Collections
        </button>
        <CaretRightIcon size={12} aria-hidden="true" />
        {level === 3 ? (
          <>
            <button type="button" onClick={() => go({ c: view.c }, `cl-design-${view.d}`)}>
              {c.name || "Untitled"}
            </button>
            <CaretRightIcon size={12} aria-hidden="true" />
          </>
        ) : null}
        <span className={css.crumbNow} aria-current="page">
          {level === 3 ? d?.name || "Untitled design" : c.name || "Untitled"}
        </span>
      </span>
    );
  }

  return (
    <div className={`${ui.root} ${css.panel}`}>
      <PanelHead title={title} back={back} />
      <div className={css.scroll}>
        {level === 1 || !view ? (
          <CollectionList onOpen={(ci) => go({ c: ci })} onAdd={() => void addCollection()} />
        ) : level === 2 ? (
          <CollectionEditor key={view.c} ci={view.c} onOpenDesign={(di) => go({ c: view.c, d: di })} onDeleted={() => go(null)} />
        ) : (
          <DesignEditor key={`${view.c}-${view.d}`} ci={view.c} di={view.d ?? 0} onDeleted={() => go({ c: view.c })} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------- level 1: collections

function MoveButtons({ name, index, count, focusKey, onMove, extra }: { name: string; index: number; count: number; focusKey: string; onMove: (to: number) => void; extra?: ReactNode }) {
  return (
    <span className={css.itemMoves}>
      <IconButton
        size="s"
        data-focus-key={`${focusKey}-up`}
        label={`Move ${name} up`}
        icon={<ArrowUpIcon size={15} />}
        disabled={index === 0}
        onClick={() => {
          onMove(index - 1);
          refocus(`${focusKey}-up`, `${focusKey}-down`);
        }}
      />
      <IconButton
        size="s"
        data-focus-key={`${focusKey}-down`}
        label={`Move ${name} down`}
        icon={<ArrowDownIcon size={15} />}
        disabled={index === count - 1}
        onClick={() => {
          onMove(index + 1);
          refocus(`${focusKey}-down`, `${focusKey}-up`);
        }}
      />
      {extra}
    </span>
  );
}

function CollectionList({ onOpen, onAdd }: { onOpen: (ci: number) => void; onAdd: () => void }) {
  const { content, setCollections } = useStudio();
  const collections = content.collections ?? [];

  return (
    <div className={css.body}>
      {collections.length === 0 ? (
        <Empty
          title="No collections yet"
          action={
            <Button variant="primary" icon={<PlusIcon size={16} aria-hidden="true" />} onClick={onAdd}>
              New collection
            </Button>
          }
        >
          A collection holds designs, and each design its colourways.
        </Empty>
      ) : (
        <>
          <p className={css.muted}>The site shows the collection cards in this order.</p>
          <ul className={css.items} aria-label="Collections">
            {collections.map((c, ci) => {
              const designs = c.designs ?? [];
              return (
                <li key={c.slug} className={css.item}>
                  <button type="button" className={css.itemOpen} data-focus-key={`cl-collection-${ci}`} onClick={() => onOpen(ci)}>
                    <span className={css.dot} style={{ backgroundColor: c.band }} aria-hidden="true" />
                    <span className={css.itemText}>
                      <strong>{c.name || "Untitled"}</strong>
                      <span>{[c.season, plural(designs.length, "design")].filter(Boolean).join(", ")}</span>
                    </span>
                  </button>
                  <MoveButtons name={c.name} index={ci} count={collections.length} focusKey={`cl-move-${c.slug}`} onMove={(to) => setCollections((cs) => moved(cs, ci, to))} />
                </li>
              );
            })}
          </ul>
          <Button variant="primary" icon={<PlusIcon size={16} aria-hidden="true" />} onClick={onAdd}>
            New collection
          </Button>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------- level 2: one collection

function Chip({ img, large }: { img: Img | null | undefined; large?: boolean }) {
  if (!img?.src) return <span className={`${css.chipEmpty} ${large ? css.chipLarge : ""}`} aria-hidden="true" />;
  return (
    <span className={`${css.chip} ${large ? css.chipLarge : ""}`} style={{ backgroundColor: img.color }} aria-hidden="true">
      <img src={asset(img.src)} alt="" loading="lazy" decoding="async" draggable={false} />
    </span>
  );
}

function CollectionEditor({ ci, onOpenDesign, onDeleted }: { ci: number; onOpenDesign: (di: number) => void; onDeleted: () => void }) {
  const lib = useLibrary();
  const { content, setCollections, updateCollection, updateRoot, openPage, toast, confirm } = lib;
  const ids = useId();
  const [slugDraft, setSlugDraft] = useState<string | null>(null);
  const [making, setMaking] = useState(false);
  const nameAtFocus = useRef("");

  const c = content.collections[ci];
  if (!c) return null;
  const designs = c.designs ?? [];
  const page = lib.pageFor(c.slug);
  const others = content.collections.filter((_, i) => i !== ci).map((x) => x.slug);
  const shades = content.site.shades ?? [];

  const set = (patch: Partial<Collection>) => updateCollection(ci, (x) => ({ ...x, ...patch }));

  const renameSlug = (to: string, root?: { id: string; patch: Partial<PageRoot> }) => {
    const from = c.slug;
    set({ slug: to });
    lib.rewritePages(collectionRefs(from, to), root);
  };

  // After a rename: the page's name follows if it matched, and so does the
  // web address while the collection has nothing on show yet.
  const afterRename = () => {
    const before = nameAtFocus.current;
    if (!c.name.trim() || before === c.name) return;
    const title = page && page.title === before ? { id: page.id, patch: { title: c.name } } : undefined;
    const next = uniqueSlug(c.name, others, "collection");
    if (!designs.some(hasShowable) && madeFrom(c.slug, before) && next !== c.slug && lib.pathFree(next, page?.id)) renameSlug(next, title);
    else if (title) updateRoot(title.id, title.patch);
  };

  const slugValue = slugDraft ?? c.slug;
  const nextSlug = slugify(slugValue);
  const slugError = slugDraft === null ? "" : !nextSlug ? "Use letters or numbers." : others.includes(nextSlug) ? "Another collection already uses this." : !lib.pathFree(nextSlug, page?.id) ? `Another page already has the address /collections/${nextSlug}.` : "";
  const slugChanged = slugDraft !== null && !slugError && nextSlug !== c.slug;
  const applySlug = () => {
    if (!slugChanged) return;
    renameSlug(nextSlug);
    setSlugDraft(null);
    toast(`The collection's address is now /collections/${nextSlug}.`, { tone: "success" });
  };

  const addDesign = () => {
    const slug = uniqueSlug("New design", designs.map((x) => x.slug), "design");
    set({ designs: [...designs, { slug, name: "New design", technique: "", story: "", colourways: [] }] });
    onOpenDesign(designs.length);
  };

  const deleteDesign = async (di: number) => {
    const dd = designs[di];
    const ok = await confirm({
      title: `Delete ${dd.name || "this design"}?`,
      body: `Its ${plural(dd.colourways.length, "colourway")} go too, and any of its swatches placed on pages disappear. The photos stay in Photos.`,
      confirm: "Delete design",
      danger: true,
    });
    if (!ok) return;
    updateCollection(ci, (x) => ({ ...x, designs: x.designs.filter((_, j) => j !== di) }));
    toast(`${dd.name || "The design"} deleted.`);
  };

  const make = async () => {
    setMaking(true);
    try {
      await lib.makePage(c);
      toast("Page made. It stays a draft until you switch that off.", { tone: "success" });
    } catch (e) {
      toast((e as Error).message || "The page couldn't be made.", { tone: "error" });
    } finally {
      setMaking(false);
    }
  };

  const remove = async () => {
    if (page) return;
    const ok = await confirm({
      title: `Delete ${c.name || "this collection"}?`,
      body: `Its ${plural(designs.length, "design")} and their colourways go too. Swatches of it placed on pages disappear. The photos stay in Photos.`,
      confirm: "Delete collection",
      danger: true,
    });
    if (!ok) return;
    setCollections((cs) => cs.filter((_, i) => i !== ci));
    toast(`${c.name || "The collection"} deleted.`);
    onDeleted();
  };

  return (
    <div className={css.body}>
      <Section title="About it">
        <div
          onFocus={() => {
            nameAtFocus.current = c.name;
          }}
          onBlur={afterRename}
        >
          <TextInput label="Name" value={c.name} onChange={(v) => set({ name: v })} placeholder="e.g. Rasaa" />
        </div>

        <Field label="Web address name" htmlFor={`${ids}-slug`} error={slugError || undefined} hint={slugChanged ? undefined : `Its page is at /collections/${c.slug}. Changing this changes links to it.`}>
          <input
            id={`${ids}-slug`}
            className={ui.input}
            value={slugValue}
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={slugError ? true : undefined}
            onChange={(e) => setSlugDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySlug();
              if (e.key === "Escape") setSlugDraft(null);
            }}
          />
        </Field>
        {slugChanged ? (
          <div className={css.callout} role="group" aria-label="Change the web address">
            <p className={css.warn}>
              This changes links. The page moves to /collections/{nextSlug}, and links to /collections/{c.slug} that people saved stop working.
            </p>
            <div className={css.rowWrap}>
              <Button size="s" variant="primary" onClick={applySlug}>
                Change the address
              </Button>
              <Button size="s" variant="ghost" onClick={() => setSlugDraft(null)}>
                Keep it as it was
              </Button>
            </div>
          </div>
        ) : null}

        <TextInput label="Season" value={c.season} onChange={(v) => set({ season: v })} placeholder="e.g. Festive 2026" />

        <Field label="Band colour" hint={`The printed band across the top of its card. ${c.band}`}>
          <div className={css.swatches} role="group" aria-label="Band colour">
            {shades.map((s) => (
              <button
                key={s.id}
                type="button"
                className={css.swatchButton}
                style={{ backgroundColor: s.hex }}
                aria-pressed={s.hex.toLowerCase() === c.band?.toLowerCase()}
                aria-label={s.name}
                title={`${s.name}, ${s.hex}`}
                onClick={() => set({ band: s.hex })}
              />
            ))}
            <input type="color" className={css.colorInput} value={validHex(c.band)} aria-label="Choose any colour" title="Choose any colour" onChange={(e) => set({ band: e.currentTarget.value })} />
          </div>
        </Field>

        <TextInput label="Tagline" value={c.line} onChange={(v) => set({ line: v })} placeholder="e.g. Borders that remember the temple" hint="One line, shown in Bodoni italic under the name." />
        <TextArea label="Introduction" value={c.intro} rows={4} onChange={(v) => set({ intro: v })} placeholder="A few sentences about the collection." />
      </Section>

      <Section
        title="Designs"
        actions={
          <Button size="s" icon={<PlusIcon size={14} aria-hidden="true" />} onClick={addDesign}>
            Add design
          </Button>
        }
      >
        {designs.length === 0 ? (
          <Empty title="No designs yet">Add a design, then give it colourways with their photos and swatches.</Empty>
        ) : (
          <ul className={css.items} aria-label={`Designs in ${c.name}`}>
            {designs.map((dd, di) => {
              const first = dd.colourways.find(isComplete);
              const unfinished = dd.colourways.length === 0 || dd.colourways.some((k) => !isComplete(k));
              return (
                <li key={dd.slug} className={css.item}>
                  <button type="button" className={css.itemOpen} data-focus-key={`cl-design-${di}`} onClick={() => onOpenDesign(di)}>
                    <Chip img={first?.chip} />
                    <span className={css.itemText}>
                      <strong>{dd.name || "Untitled design"}</strong>
                      <span>{[dd.technique, plural(dd.colourways.length, "colourway")].filter(Boolean).join(", ")}</span>
                    </span>
                    {unfinished ? (
                      <span title="Not finished: some colourways still need a close-up photo and a swatch" style={{ color: "var(--s-warn)", display: "inline-flex" }}>
                        <WarningIcon size={16} aria-hidden="true" />
                        <span className={css.visuallyHidden}>Not finished</span>
                      </span>
                    ) : null}
                  </button>
                  <MoveButtons
                    name={dd.name}
                    index={di}
                    count={designs.length}
                    focusKey={`cl-move-${c.slug}-${dd.slug}`}
                    onMove={(to) => updateCollection(ci, (x) => ({ ...x, designs: moved(x.designs, di, to) }))}
                    extra={<IconButton size="s" label={`Delete ${dd.name || "this design"}`} icon={<TrashIcon size={15} />} onClick={() => void deleteDesign(di)} />}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Its page">
        {page ? (
          <>
            <p className={css.muted}>
              {page.title} at {page.path}
              {page.draft ? ", still a draft." : "."}
            </p>
            <Button icon={<ArrowSquareOutIcon size={16} aria-hidden="true" />} onClick={() => openPage(page.id)}>
              Open its page
            </Button>
          </>
        ) : (
          <>
            <p className={css.muted}>This collection has no page yet, so its card on the site leads nowhere.</p>
            <Button variant="primary" icon={making ? <Spinner /> : <PlusIcon size={16} aria-hidden="true" />} disabled={making} onClick={() => void make()}>
              {making ? "Making its page…" : "Make its page"}
            </Button>
          </>
        )}
      </Section>

      <Section title="Delete">
        {page ? <p className={css.muted}>A collection can&apos;t be deleted while it has a page. Delete the page {page.title} in Pages first, then come back here.</p> : null}
        <Button variant="danger" icon={<TrashIcon size={16} aria-hidden="true" />} disabled={Boolean(page)} onClick={() => void remove()}>
          Delete collection
        </Button>
      </Section>
    </div>
  );
}

// ----------------------------------------------------- level 3: one design

function DesignEditor({ ci, di, onDeleted }: { ci: number; di: number; onDeleted: () => void }) {
  const lib = useLibrary();
  const { content, updateDesign, updateCollection, toast, confirm } = lib;
  const ids = useId();
  const [slugDraft, setSlugDraft] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const nameAtFocus = useRef("");

  const c = content.collections[ci];
  const d = c?.designs[di];
  if (!c || !d) return null;
  const colourways = d.colourways ?? [];
  const siblings = c.designs.filter((_, j) => j !== di).map((x) => x.slug);

  const set = (patch: Partial<Design>) => updateDesign(ci, di, (x) => ({ ...x, ...patch }));

  const renameSlug = (to: string) => {
    const from = d.slug;
    set({ slug: to });
    lib.rewritePages(designRefs(c.slug, from, to));
  };

  // The slug follows the name until she sets it herself or the design is on show.
  const afterRename = () => {
    const before = nameAtFocus.current;
    if (!d.name.trim() || before === d.name || hasShowable(d) || !madeFrom(d.slug, before)) return;
    const next = uniqueSlug(d.name, siblings, "design");
    if (next !== d.slug) renameSlug(next);
  };

  const slugValue = slugDraft ?? d.slug;
  const nextSlug = slugify(slugValue);
  const slugError = slugDraft === null ? "" : !nextSlug ? "Use letters or numbers." : siblings.includes(nextSlug) ? `Another design in ${c.name} already uses this.` : "";
  const commitSlug = () => {
    if (slugDraft === null || slugError) return;
    if (nextSlug !== d.slug) renameSlug(nextSlug);
    setSlugDraft(null);
  };

  const addColourway = () => {
    const name = "New colourway";
    const id = uniqueSlug(name, colourways.map((k) => k.id), "colourway");
    const cw: Colourway = { id, name, url: "", seenAs: "Printed Fabric", swatchFrom: "Printed Fabric", swatch: NO_PHOTO, scene: null, chip: NO_CHIP };
    set({ colourways: [...colourways, cw] });
    setOpen(colourways.length);
  };

  const removeColourway = async (ki: number) => {
    const k = colourways[ki];
    const ok = await confirm({
      title: `Delete ${k.name || "this colourway"}?`,
      body: "Its swatch disappears from any page it is placed on. The photos stay in Photos.",
      confirm: "Delete colourway",
      danger: true,
    });
    if (!ok) return;
    updateDesign(ci, di, (x) => ({ ...x, colourways: x.colourways.filter((_, j) => j !== ki) }));
    setOpen(null);
    toast(`${k.name || "The colourway"} deleted.`);
  };

  const moveColourway = (ki: number, to: number) => {
    updateDesign(ci, di, (x) => ({ ...x, colourways: moved(x.colourways, ki, to) }));
    if (open === ki) setOpen(to);
    else if (open === to) setOpen(ki);
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${d.name || "this design"}?`,
      body: `Its ${plural(colourways.length, "colourway")} go too, and any of its swatches placed on pages disappear. The photos stay in Photos.`,
      confirm: "Delete design",
      danger: true,
    });
    if (!ok) return;
    updateCollection(ci, (x) => ({ ...x, designs: x.designs.filter((_, j) => j !== di) }));
    toast(`${d.name || "The design"} deleted.`);
    onDeleted();
  };

  return (
    <div className={css.body}>
      <Section title="About it">
        <div
          onFocus={() => {
            nameAtFocus.current = d.name;
          }}
          onBlur={afterRename}
        >
          <TextInput label="Name" value={d.name} onChange={(v) => set({ name: v })} placeholder="e.g. Kinari" />
        </div>
        <Field label="Web address name" htmlFor={`${ids}-slug`} error={slugError || undefined} hint={`Links to the design end in #${nextSlug || d.slug}. Swatches placed on pages keep pointing at it.`}>
          <input
            id={`${ids}-slug`}
            className={ui.input}
            value={slugValue}
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={slugError ? true : undefined}
            onChange={(e) => setSlugDraft(e.currentTarget.value)}
            onBlur={commitSlug}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSlug();
              if (e.key === "Escape") setSlugDraft(null);
            }}
          />
        </Field>
        <TextInput label="Technique" value={d.technique} onChange={(v) => set({ technique: v })} placeholder="e.g. Woven zari border" />
        <TextArea label="Story" value={d.story} rows={4} onChange={(v) => set({ story: v })} placeholder="What the design is and where it comes from." />
      </Section>

      <Section
        title="Colourways"
        actions={
          <Button size="s" icon={<PlusIcon size={14} aria-hidden="true" />} onClick={addColourway}>
            Add colourway
          </Button>
        }
      >
        {colourways.length === 0 ? (
          <Empty title="No colourways yet">Each colourway needs a close-up photo of the cloth and a swatch cut from it.</Empty>
        ) : (
          <>
            <p className={css.muted}>The first finished colourway is the swatch shown on the collection cards.</p>
            <ul className={css.cards} aria-label={`Colourways of ${d.name}`}>
              {colourways.map((cw, ki) => (
                <ColourwayCard
                  key={cw.id}
                  ci={ci}
                  di={di}
                  ki={ki}
                  cw={cw}
                  count={colourways.length}
                  open={open === ki}
                  siblings={colourways.filter((_, j) => j !== ki).map((k) => k.id)}
                  collectionSlug={c.slug}
                  designSlug={d.slug}
                  onToggle={() => setOpen(open === ki ? null : ki)}
                  onMove={(to) => moveColourway(ki, to)}
                  onDelete={() => void removeColourway(ki)}
                />
              ))}
            </ul>
          </>
        )}
        <Button icon={<PlusIcon size={16} aria-hidden="true" />} onClick={addColourway}>
          Add colourway
        </Button>
      </Section>

      <Section title="Delete">
        <Button variant="danger" icon={<TrashIcon size={16} aria-hidden="true" />} onClick={() => void remove()}>
          Delete design
        </Button>
      </Section>
    </div>
  );
}

// ------------------------------------------------------------- colourways

function PhotoSlot({ label, hint, img, onChoose, onRemove }: { label: string; hint?: string; img: Img | null | undefined; onChoose: () => void; onRemove?: () => void }) {
  const has = Boolean(img?.src);
  return (
    <div className={css.stack} role="group" aria-label={label}>
      <span className={ui.label}>{label}</span>
      <div className={css.photoSlot}>
        {has && img ? (
          <span className={css.photoThumb} style={{ backgroundColor: img.color, backgroundImage: img.blur ? `url("${img.blur}")` : undefined }}>
            <img src={asset(img.src)} alt="" loading="lazy" decoding="async" draggable={false} />
          </span>
        ) : (
          <span className={css.photoThumbEmpty} aria-hidden="true">
            <ImageSquareIcon size={22} />
          </span>
        )}
        <div className={css.photoSlotText}>
          <Button size="s" onClick={onChoose}>
            {has ? "Change photo" : "Choose photo"}
          </Button>
          {has && onRemove ? (
            <Button size="s" variant="ghost" onClick={onRemove}>
              Take it off
            </Button>
          ) : null}
        </div>
      </div>
      {hint ? <p className={css.muted}>{hint}</p> : null}
    </div>
  );
}

const typeOptions = (current: string) => [...new Set([...PRODUCT_TYPES, current].filter(Boolean))].map((t) => ({ label: t, value: t }));

function ColourwayCard({
  ci,
  di,
  ki,
  cw,
  count,
  open,
  siblings,
  collectionSlug,
  designSlug,
  onToggle,
  onMove,
  onDelete,
}: {
  ci: number;
  di: number;
  ki: number;
  cw: Colourway;
  count: number;
  open: boolean;
  siblings: string[];
  collectionSlug: string;
  designSlug: string;
  onToggle: () => void;
  onMove: (to: number) => void;
  onDelete: () => void;
}) {
  const lib = useLibrary();
  const { updateColourway, pickPhoto, toast } = lib;
  const bodyId = useId();
  const [cutting, setCutting] = useState(false);
  const nameAtFocus = useRef("");

  const complete = isComplete(cw);
  const update = (patch: Partial<Colourway>) => updateColourway(ci, di, ki, (k) => ({ ...k, ...patch }));

  // The id follows the name while the colourway isn't on show yet.
  const afterRename = () => {
    const before = nameAtFocus.current;
    if (!cw.name.trim() || before === cw.name || complete || !madeFrom(cw.id, before)) return;
    const next = uniqueSlug(cw.name, siblings, "colourway");
    if (next === cw.id) return;
    lib.rewritePages(colourwayRefs(collectionSlug, designSlug, cw.id, next));
    update({ id: next });
  };

  const chooseScene = async () => {
    const p = await pickPhoto({ title: `Photo of ${cw.name || "this colourway"} in a room`, current: cw.scene?.src ? cw.scene : null });
    if (p) update({ scene: imgOf(p) });
  };

  const chooseSwatch = async () => {
    const p = await pickPhoto({ title: `Close-up of ${cw.name || "this colourway"}`, current: cw.swatch?.src ? cw.swatch : null });
    if (!p) return;
    update({ swatch: imgOf(p) });
    if (!cw.chip?.src) setCutting(true);
    else toast("New close-up chosen. Cut a new swatch from it if the old one no longer matches.");
  };

  const setType = (v: string) => updateColourway(ci, di, ki, (k) => ({ ...k, seenAs: v, swatchFrom: k.swatchFrom === k.seenAs ? v : k.swatchFrom }));

  const name = cw.name || "Untitled colourway";

  return (
    <li className={css.card} data-open={open || undefined}>
      <div className={css.cardHead}>
        <button type="button" className={css.cardToggle} aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
          <CaretRightIcon size={13} aria-hidden="true" />
          <Chip img={cw.chip} />
          <span className={css.itemText}>
            <strong>{name}</strong>
            <span>{[cw.seenAs, complete && cw.chip.shade ? `ground ${cw.chip.shade.toUpperCase()}` : ""].filter(Boolean).join(", ")}</span>
          </span>
          {!complete ? (
            <span className={css.badge} title="Incomplete: add a close-up photo and cut a swatch">
              Incomplete
            </span>
          ) : null}
        </button>
        <MoveButtons name={name} index={ki} count={count} focusKey={`cl-move-cw-${collectionSlug}-${designSlug}-${cw.id}`} onMove={onMove} />
      </div>

      {open ? (
        <div id={bodyId} className={css.cardBody}>
          {!complete ? (
            <p className={css.warn} role="note">
              Incomplete: add a close-up photo and cut a swatch. Until then the site leaves this colourway out.
            </p>
          ) : null}

          <div
            onFocus={() => {
              nameAtFocus.current = cw.name;
            }}
            onBlur={afterRename}
          >
            <TextInput label="Name" value={cw.name} onChange={(v) => update({ name: v })} placeholder="e.g. Brick Red" />
          </div>
          <TextInput label="Shop link" type="url" value={cw.url} onChange={(v) => update({ url: v.trim() })} placeholder="https://theyellowdwelling.com/products/…" hint="The shop page for this colourway." />

          <PhotoSlot label="Photo shown in the room" hint="Optional. Shown in the window when someone picks this swatch; without it, the close-up is shown." img={cw.scene} onChoose={() => void chooseScene()} onRemove={() => update({ scene: null })} />
          <PhotoSlot label="Close-up of the cloth" hint="The swatch is cut from this photo." img={cw.swatch} onChoose={() => void chooseSwatch()} />

          <Select label="Product type" hint={`What the photo shows. The caption reads, for example, "As a blind".`} value={cw.seenAs} options={typeOptions(cw.seenAs)} onChange={setType} />
          <details className={css.more}>
            <summary>
              <CaretRightIcon size={12} aria-hidden="true" />
              More
            </summary>
            <div>
              <Select label="Close-up is from" hint="When the close-up was taken from a different product than the room photo." value={cw.swatchFrom} options={typeOptions(cw.swatchFrom)} onChange={(v) => update({ swatchFrom: v })} />
            </div>
          </details>

          <div className={css.stack} role="group" aria-label="Swatch">
            <span className={ui.label}>Swatch</span>
            <div className={css.chipRow}>
              <Chip img={cw.chip} large />
              <div className={css.chipFacts}>
                {cw.chip?.src ? <span className={css.shadeCode}>Ground {cw.chip.shade?.toUpperCase()}</span> : <span className={css.muted}>No swatch yet</span>}
                <Button size="s" icon={<ScissorsIcon size={14} aria-hidden="true" />} disabled={!cw.swatch?.src} onClick={() => setCutting(true)}>
                  Cut a new swatch
                </Button>
              </div>
            </div>
            <p className={css.muted}>{cw.swatch?.src ? "The swatch's colour code is measured from the cloth automatically." : "Choose a close-up of the cloth first, then cut the swatch from it. Its colour code is measured from the cloth automatically."}</p>
          </div>

          <div>
            <Button size="s" variant="danger" icon={<TrashIcon size={14} aria-hidden="true" />} onClick={onDelete}>
              Delete colourway
            </Button>
          </div>
        </div>
      ) : null}

      {cutting && cw.swatch?.src ? (
        <SwatchCutter
          photo={cw.swatch}
          name={name}
          onClose={() => setCutting(false)}
          onCut={(chip) => {
            update({ chip });
            setCutting(false);
            toast(`Swatch cut. Ground ${chip.shade.toUpperCase()}.`, { tone: "success" });
          }}
        />
      ) : null}
    </li>
  );
}

// ---------------------------------------------------------- swatch cutting

function SwatchCutter({ photo, name, onClose, onCut }: { photo: Img; name: string; onClose: () => void; onCut: (chip: Colourway["chip"]) => void }) {
  const ids = useId();
  const [focus, setFocus] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const stage = useRef<HTMLDivElement>(null);
  const pressed = useRef(false);

  const W = photo.width || 1;
  const H = photo.height || 1;
  const side = (Math.min(W, H) * size) / 100;
  const wPct = (side / W) * 100;
  const hPct = (side / H) * 100;
  const left = clamp(focus.x - wPct / 2, 0, 100 - wPct);
  const top = clamp(focus.y - hPct / 2, 0, 100 - hPct);

  const place = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setFocus({ x: clamp(((e.clientX - r.left) / r.width) * 100, 0, 100), y: clamp(((e.clientY - r.top) / r.height) * 100, 0, 100) });
  };

  const nudge = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = moves[e.key];
    if (!d) return;
    e.preventDefault();
    setFocus((f) => ({ x: clamp(f.x + d[0], 0, 100), y: clamp(f.y + d[1], 0, 100) }));
  };

  const cut = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.swatch(photo.src, { x: Math.round(focus.x * 10) / 10, y: Math.round(focus.y * 10) / 10 }, size / 100);
      const chip: Colourway["chip"] = { src: res.src, width: res.width, height: res.height, blur: res.blur, color: res.color, shade: res.shade };
      onCut(chip);
    } catch (e) {
      setError((e as Error).message || "The swatch couldn't be cut. Try again.");
      setBusy(false);
    }
  };

  // The chip as it will be cut, from the same photo.
  const preview: CSSProperties = {
    backgroundColor: photo.color,
    backgroundImage: `url("${asset(photo.src)}")`,
    backgroundSize: `${(100 / wPct) * 100}% ${(100 / hPct) * 100}%`,
    backgroundPosition: `${wPct >= 100 ? 0 : (left / (100 - wPct)) * 100}% ${hPct >= 100 ? 0 : (top / (100 - hPct)) * 100}%`,
  };

  return (
    <Dialog
      open
      title={`Cut a swatch from ${name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={busy ? <Spinner /> : <ScissorsIcon size={16} aria-hidden="true" />} disabled={busy} onClick={() => void cut()}>
            {busy ? "Cutting…" : "Cut swatch"}
          </Button>
        </>
      }
    >
      <div className={css.cutter}>
        <p className={css.muted} id={`${ids}-how`}>
          Click the middle of the area to cut, or move it with the arrow keys. Choose a flat stretch of cloth that shows the pattern well.
        </p>
        <div
          ref={stage}
          className={css.cutStage}
          tabIndex={0}
          role="group"
          aria-label={`Where to cut: ${Math.round(focus.x)}% across, ${Math.round(focus.y)}% down`}
          aria-describedby={`${ids}-how`}
          style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, calc(50dvh * ${W / H}))`, backgroundImage: photo.blur ? `url("${photo.blur}")` : undefined }}
          onPointerDown={(e) => {
            pressed.current = true;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // Not every pointer can be captured; the outline still follows it over the photo.
            }
            place(e);
          }}
          onPointerMove={(e) => {
            if (pressed.current) place(e);
          }}
          onPointerUp={() => {
            pressed.current = false;
          }}
          onPointerCancel={() => {
            pressed.current = false;
          }}
          onKeyDown={nudge}
        >
          <img src={asset(photo.src)} alt="" draggable={false} />
          <span className={css.cutBox} style={{ left: `${left}%`, top: `${top}%`, width: `${wPct}%`, height: `${hPct}%` }} />
        </div>

        <Field label="How much of the photo" htmlFor={`${ids}-size`}>
          <div className={css.row}>
            <input id={`${ids}-size`} className={css.range} type="range" min={15} max={100} step={1} value={size} onChange={(e) => setSize(Number(e.currentTarget.value))} />
            <output htmlFor={`${ids}-size`} style={{ minWidth: 40, textAlign: "right" }}>
              {size}%
            </output>
          </div>
        </Field>

        <div className={css.cutPreview}>
          <span className={`${css.chip} ${css.chipLarge}`} style={preview} aria-hidden="true" />
          <p className={css.muted}>The swatch will look like this. Its colour code is measured from the cloth automatically.</p>
        </div>

        {error ? (
          <p className={ui.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

export default CollectionsPanel;
