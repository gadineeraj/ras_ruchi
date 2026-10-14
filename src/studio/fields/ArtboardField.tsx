"use client";

// The free canvas editor (field kind "artboard"): a live copy of the board in
// the settings drawer, and the same board at full size in a dialog. Drag to
// move, pull the corner to resize, turn with the top handle; items snap to the
// edges and the middle. Changes are saved when she lets go, not while dragging.
/* eslint-disable @next/next/no-img-element -- The board previews local files at a few hundred pixels; plain images keep it light. */
import { createUsePuck } from "@puckeditor/core";
import { ArrowLineDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowLineDown";
import { ArrowLineUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowLineUp";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/dist/ssr/ArrowsOutSimple";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/ssr/CopySimple";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import type { CanvasItem } from "@/blocks/layout";
import blockStyles from "@/blocks/blocks.module.css";
import { onShade } from "@/blocks/shared";
import type { Collection, Shade } from "@/lib/content-types";
import { isComplete, pickToSwatch } from "@/lib/library";
import { asset } from "@/lib/paths";
import { useStudio } from "../state";
import { Button, Dialog, Field, IconButton, Segmented, TextArea, ui } from "../ui";
import { fieldRenderers } from "./index";
import type { FieldProps, FieldRenderer } from "./types";
import css from "./artboard.module.css";

const usePuck = createUsePuck();

// The colourway control from the settings controls, when it is there.
const ColourwayControl: FieldRenderer | undefined = fieldRenderers.colourway;

const SNAP = 1.5;
const MIN = 3;
const TURN = 45;

type Kind = CanvasItem["kind"];
type Mode = "move" | "resize" | "rotate";
type Guides = { v?: number; h?: number };
type Draft = { base: CanvasItem[]; items: CanvasItem[]; saved: boolean };

const KIND_NAME: Record<Kind, string> = { text: "Words", photo: "Photo", swatch: "Swatch", shape: "Shape" };

// ----------------------------------------------------------------- helpers

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v * 100) / 100;
const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const newId = (kind: Kind) => `${kind}-${Math.random().toString(36).slice(2, 9)}`;

/** "16:9" → 1.78. The board's width over its height. */
function ratioOf(ratio: unknown) {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(String(ratio ?? ""));
  return m && Number(m[2]) > 0 ? Number(m[1]) / Number(m[2]) : 16 / 9;
}

/** Only well-formed items, with every number present. */
function normalise(value: unknown): CanvasItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((it): it is CanvasItem => Boolean(it) && typeof it === "object" && typeof (it as CanvasItem).id === "string" && Boolean((it as CanvasItem).kind))
    .map((it) => ({ ...it, x: num(it.x, 0), y: num(it.y, 0), w: num(it.w, 20), h: num(it.h, 20), rotate: num(it.rotate, 0), z: num(it.z, 1) }));
}

/** The board's colour, the way the block colours it. */
function surface(bg: string): { attr: string; style?: CSSProperties } {
  if (!bg || bg === "none" || bg === "board") return { attr: "none" };
  if (bg === "card") return { attr: "card" };
  return { attr: "shade", style: { "--shade": bg, "--on-shade": onShade(bg) === "light" ? "#f7f3ee" : "#1b1a14" } as CSSProperties };
}

/** Snaps a box's edges or middle to the board's edges or middle. */
function snap(pos: number, size: number): { pos: number; guide?: number } {
  let best: { delta: number; guide: number } | null = null;
  for (const target of [0, 50, 100]) {
    for (const edge of [0, size / 2, size]) {
      const delta = target - (pos + edge);
      if (Math.abs(delta) <= SNAP && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, guide: target };
    }
  }
  return best ? { pos: pos + best.delta, guide: best.guide } : { pos };
}

/** Snaps a box's far edge (right or bottom) while resizing. */
function snapEnd(start: number, size: number): { size: number; guide?: number } {
  for (const target of [50, 100]) if (Math.abs(start + size - target) <= SNAP && target - start >= MIN) return { size: target - start, guide: target };
  return { size };
}

function describe(it: CanvasItem, collections: Collection[]) {
  if (it.kind === "text") return `Words: ${(it.text ?? "").trim().slice(0, 48) || "empty"}`;
  if (it.kind === "photo") return it.photo?.src ? `Photo${it.photo.alt ? `: ${it.photo.alt}` : ""}` : "Photo, not chosen yet";
  if (it.kind === "swatch") {
    const sw = it.pick ? pickToSwatch(collections, it.pick) : null;
    return sw ? `Swatch: ${sw.design} in ${sw.colourway}` : "Swatch, not chosen yet";
  }
  return "Shape";
}

function firstPick(collections: Collection[]) {
  for (const c of collections) for (const d of c.designs ?? []) for (const k of d.colourways ?? []) if (isComplete(k)) return `${c.slug}/${d.slug}/${k.id}`;
  return "";
}

// ------------------------------------------------------------------- field

export const artboard: FieldRenderer = (props) => <ArtboardField {...(props as FieldProps<CanvasItem[] | null | undefined>)} />;

function ArtboardField({ field, id, value, onChange, readOnly }: FieldProps<CanvasItem[] | null | undefined>) {
  const { content, pickPhoto, toast } = useStudio();
  const ratio = usePuck((s) => (s.selectedItem?.props as { ratio?: unknown } | undefined)?.ratio);
  const background = usePuck((s) => (s.selectedItem?.props as { background?: unknown } | undefined)?.background);
  const ar = ratioOf(ratio);
  const bg = typeof background === "string" ? background : "card";
  const collections = content.collections ?? [];
  const shades = content.site.shades ?? [];

  const items = useMemo(() => normalise(value), [value]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const shown = draft && draft.base === items ? draft.items : items;
  const [selected, setSelected] = useState<string | null>(null);
  const [big, setBig] = useState(false);
  const small = useRef<HTMLDivElement>(null);
  const large = useRef<HTMLDivElement>(null);
  const sel = shown.find((i) => i.id === selected) ?? null;
  const topZ = shown.reduce((m, i) => Math.max(m, i.z), 0);

  // While dragging, only the draft changes; letting go saves it once.
  const live = (next: CanvasItem[]) => setDraft({ base: items, items: next, saved: false });
  const commit = (next: CanvasItem[]) => {
    if (readOnly) return;
    setDraft({ base: items, items: next, saved: true });
    onChange(next);
  };
  const commitDraft = () => {
    if (draft && draft.base === items && !draft.saved) commit(draft.items);
  };
  const patched = (itemId: string, p: Partial<CanvasItem>) => shown.map((i) => (i.id === itemId ? { ...i, ...p } : i));
  const patch = (itemId: string, p: Partial<CanvasItem>) => commit(patched(itemId, p));

  const focusItem = (itemId: string, inBig = big) => {
    requestAnimationFrame(() => (inBig ? large : small).current?.querySelector<HTMLElement>(`[data-item="${CSS.escape(itemId)}"]`)?.focus({ preventScroll: true }));
  };

  const place = (w: number, h: number) => {
    const n = shown.length % 5;
    return { x: round(clamp(50 - w / 2 + n * 3 - 6, 0, 100 - w)), y: round(clamp(50 - h / 2 + n * 3 - 6, 0, 100 - h)) };
  };

  const add = (item: CanvasItem) => {
    commit([...shown, item]);
    setSelected(item.id);
    focusItem(item.id);
  };

  const addText = () => add({ id: newId("text"), kind: "text", ...place(40, 12), w: 40, h: 12, rotate: 0, z: topZ + 1, text: "Your words", textStyle: "body", fontSize: 3, align: "start" });

  const addPhoto = async () => {
    const photo = await pickPhoto({ title: "Choose a photo for the board" });
    if (!photo) return;
    let w = 30;
    let h = w * ar * (photo.height / Math.max(1, photo.width));
    if (h > 80) {
      w = (w * 80) / h;
      h = 80;
    }
    add({ id: newId("photo"), kind: "photo", ...place(w, h), w: round(w), h: round(h), rotate: 0, z: topZ + 1, photo, frame: "plain" });
  };

  const addSwatch = () => {
    const w = 14;
    add({ id: newId("swatch"), kind: "swatch", ...place(w, w * ar), w, h: round(w * ar), rotate: 0, z: topZ + 1, pick: firstPick(collections) });
  };

  const addShape = () => add({ id: newId("shape"), kind: "shape", ...place(26, 34), w: 26, h: 34, rotate: 0, z: topZ + 1, color: shades[0]?.hex ?? "#6a2222" });

  const remove = (itemId: string) => {
    commit(shown.filter((i) => i.id !== itemId));
    setSelected(null);
    toast("Removed from the board. Undo at the top brings it back.");
  };

  const duplicate = (it: CanvasItem) => {
    const copy: CanvasItem = { ...structuredClone(it), id: newId(it.kind), x: round(clamp(it.x + 3, 0, Math.max(0, 100 - it.w))), y: round(clamp(it.y + 3, 0, Math.max(0, 100 - it.h))), z: topZ + 1 };
    add(copy);
  };

  /** Swaps an item with the one just above (1) or below (-1) it. */
  const layer = (it: CanvasItem, dir: 1 | -1) => {
    const order = [...shown].sort((a, b) => a.z - b.z);
    const at = order.findIndex((i) => i.id === it.id);
    const to = at + dir;
    if (at < 0 || to < 0 || to >= order.length) return;
    [order[at], order[to]] = [order[to], order[at]];
    const z = new Map(order.map((i, n) => [i.id, n + 1]));
    commit(shown.map((i) => ({ ...i, z: z.get(i.id) ?? i.z })));
  };
  const stack = [...shown].sort((a, b) => a.z - b.z);
  const isTop = sel ? stack[stack.length - 1]?.id === sel.id : true;
  const isBottom = sel ? stack[0]?.id === sel.id : true;

  const onKey = (e: KeyboardEvent<HTMLElement>, it: CanvasItem) => {
    if (e.target !== e.currentTarget) return;
    const step = e.shiftKey ? 5 : 0.5;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const mv = arrows[e.key];
    if (mv) {
      e.preventDefault();
      e.stopPropagation();
      if (!readOnly) patch(it.id, { x: round(clamp(it.x + mv[0], 0, Math.max(0, 100 - it.w))), y: round(clamp(it.y + mv[1], 0, Math.max(0, 100 - it.h))) });
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
      if (!readOnly) remove(it.id);
      return;
    }
    if (e.key === "Escape" && selected) {
      e.preventDefault();
      e.stopPropagation();
      setSelected(null);
    }
  };

  const board = (inBig: boolean) => (
    <Board
      boardRef={inBig ? large : small}
      items={shown}
      ar={ar}
      bg={bg}
      big={inBig}
      selected={selected}
      readOnly={readOnly}
      collections={collections}
      onSelect={setSelected}
      onLive={live}
      onCommit={commit}
      onKey={onKey}
    />
  );

  const tools = (
    <div className={css.adds} role="group" aria-label="Add to the board">
        <Button size="s" icon={<PlusIcon size={13} aria-hidden="true" />} disabled={readOnly} onClick={addText} aria-label="Add words">
          Text
        </Button>
        <Button size="s" icon={<PlusIcon size={13} aria-hidden="true" />} disabled={readOnly} onClick={() => void addPhoto()} aria-label="Add a photo">
          Photo
        </Button>
        <Button size="s" icon={<PlusIcon size={13} aria-hidden="true" />} disabled={readOnly} onClick={addSwatch} aria-label="Add a swatch">
          Swatch
        </Button>
        <Button size="s" icon={<PlusIcon size={13} aria-hidden="true" />} disabled={readOnly} onClick={addShape} aria-label="Add a shape">
          Shape
        </Button>
    </div>
  );

  const layers = (
    <div className={css.layers} role="group" aria-label="Selected item">
      <IconButton size="s" label="Bring forward" icon={<ArrowLineUpIcon size={16} />} disabled={!sel || readOnly || isTop} onClick={() => sel && layer(sel, 1)} />
      <IconButton size="s" label="Send back" icon={<ArrowLineDownIcon size={16} />} disabled={!sel || readOnly || isBottom} onClick={() => sel && layer(sel, -1)} />
      <IconButton size="s" label="Duplicate" icon={<CopySimpleIcon size={16} />} disabled={!sel || readOnly} onClick={() => sel && duplicate(sel)} />
      <IconButton size="s" label="Delete" icon={<TrashIcon size={16} />} disabled={!sel || readOnly} onClick={() => sel && remove(sel.id)} />
    </div>
  );

  const properties = sel ? (
    <Properties
      key={sel.id}
      id={id}
      it={sel}
      shades={shades}
      collections={collections}
      readOnly={readOnly}
      onPatch={(p) => patch(sel.id, p)}
      onLive={(p) => live(patched(sel.id, p))}
      onDone={commitDraft}
      onChoosePhoto={async () => {
        const photo = await pickPhoto({ title: "Choose a photo for the board", current: sel.photo ?? null });
        if (!photo) return;
        const p: Partial<CanvasItem> = { photo };
        if (!sel.photo?.src) p.h = round(clamp(sel.w * ar * (photo.height / Math.max(1, photo.width)), MIN, 100 - sel.y));
        patch(sel.id, p);
      }}
    />
  ) : (
    <p className={css.hint}>Click something on the board to change it. Drag to move it, pull its corner to resize, turn it with the top handle. Arrow keys nudge it; hold Shift to move further.</p>
  );

  return (
    <div className={css.root}>
      {field.label ? <span className={ui.label}>{field.label}</span> : null}
      {tools}
      {board(false)}
      <div className={css.bar}>
        {layers}
        <Button size="s" variant="ghost" icon={<ArrowsOutSimpleIcon size={15} aria-hidden="true" />} onClick={() => setBig(true)}>
          Arrange on a big board
        </Button>
      </div>
      {big ? null : properties}

      <Dialog
        open={big}
        size="l"
        title="Arrange the board"
        onClose={() => setBig(false)}
        footer={
          <Button variant="primary" onClick={() => setBig(false)}>
            Done
          </Button>
        }
      >
        <div className={css.bigLayout}>
          <div className={css.bar}>
            <div style={{ flex: "1 1 320px", maxWidth: 420 }}>{tools}</div>
            {layers}
          </div>
          {big ? board(true) : null}
          {properties}
        </div>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------------- board

type BoardProps = {
  boardRef: RefObject<HTMLDivElement | null>;
  items: CanvasItem[];
  ar: number;
  bg: string;
  big?: boolean;
  selected: string | null;
  readOnly?: boolean;
  collections: Collection[];
  onSelect: (id: string | null) => void;
  onLive: (next: CanvasItem[]) => void;
  onCommit: (next: CanvasItem[]) => void;
  onKey: (e: KeyboardEvent<HTMLElement>, it: CanvasItem) => void;
};

type Drag = { mode: Mode; id: string; x0: number; y0: number; rect: DOMRect; orig: CanvasItem; base: CanvasItem[]; moved: boolean; cx: number; cy: number; last: CanvasItem[] | null };

function Board({ boardRef, items, ar, bg, big, selected, readOnly, collections, onSelect, onLive, onCommit, onKey }: BoardProps) {
  const drag = useRef<Drag | null>(null);
  const [guides, setGuides] = useState<Guides>({});
  const look = surface(bg);
  const sorted = [...items].sort((a, b) => a.z - b.z);

  const begin = (e: PointerEvent<HTMLElement>, it: CanvasItem, mode: Mode) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(it.id);
    const board = boardRef.current;
    const el = board?.querySelector<HTMLElement>(`[data-item="${CSS.escape(it.id)}"]`);
    el?.focus({ preventScroll: true });
    if (readOnly || !board) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured; the board still follows it while it stays over the board.
    }
    const r = el?.getBoundingClientRect();
    drag.current = { mode, id: it.id, x0: e.clientX, y0: e.clientY, rect: board.getBoundingClientRect(), orig: it, base: items, moved: false, cx: r ? r.left + r.width / 2 : 0, cy: r ? r.top + r.height / 2 : 0, last: null };
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const px = e.clientX - d.x0;
    const py = e.clientY - d.y0;
    if (!d.moved && Math.abs(px) + Math.abs(py) < 3) return;
    d.moved = true;
    const dx = (px / d.rect.width) * 100;
    const dy = (py / d.rect.height) * 100;
    const o = d.orig;
    const g: Guides = {};
    let next: CanvasItem = o;

    if (d.mode === "move") {
      const maxX = Math.max(0, 100 - o.w);
      const maxY = Math.max(0, 100 - o.h);
      let x = clamp(o.x + dx, 0, maxX);
      let y = clamp(o.y + dy, 0, maxY);
      const sx = snap(x, o.w);
      const sy = snap(y, o.h);
      if (sx.guide !== undefined) {
        x = clamp(sx.pos, 0, maxX);
        g.v = sx.guide;
      }
      if (sy.guide !== undefined) {
        y = clamp(sy.pos, 0, maxY);
        g.h = sy.guide;
      }
      next = { ...o, x: round(x), y: round(y) };
    } else if (d.mode === "resize") {
      const maxW = Math.max(MIN, 100 - o.x);
      const maxH = Math.max(MIN, 100 - o.y);
      let w = clamp(o.w + dx, MIN, maxW);
      let h = clamp(o.h + dy, MIN, maxH);
      if (o.kind === "swatch") {
        // Swatches stay square on the page, whatever the board's shape.
        h = w * ar;
        if (h > maxH) {
          h = maxH;
          w = h / ar;
        }
      } else if (e.shiftKey && o.w > 0 && o.h > 0) {
        const s = Math.min(Math.max(w / o.w, h / o.h), maxW / o.w, maxH / o.h);
        w = Math.max(MIN, o.w * s);
        h = Math.max(MIN, o.h * s);
      } else {
        const sw = snapEnd(o.x, w);
        const sh = snapEnd(o.y, h);
        w = sw.size;
        h = sh.size;
        if (sw.guide !== undefined) g.v = sw.guide;
        if (sh.guide !== undefined) g.h = sh.guide;
      }
      next = { ...o, w: round(w), h: round(h) };
    } else {
      const deg = (Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * 180) / Math.PI + 90;
      let r = ((((deg + 180) % 360) + 360) % 360) - 180;
      r = e.shiftKey ? Math.round(r / 15) * 15 : Math.abs(r) < 2 ? 0 : Math.round(r);
      next = { ...o, rotate: clamp(r, -TURN, TURN) };
    }

    d.last = d.base.map((i) => (i.id === o.id ? next : i));
    setGuides(g);
    onLive(d.last);
  };

  const end = () => {
    const d = drag.current;
    drag.current = null;
    setGuides({});
    if (d?.moved && d.last) onCommit(d.last);
  };

  return (
    <div className={css.stage}>
      <div
        ref={boardRef}
        className={`${css.board} ${big ? css.big : ""}`}
        data-bg={look.attr}
        style={{ aspectRatio: String(ar), "--ar": ar, ...look.style } as CSSProperties}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        role="group"
        aria-label="The board"
      >
        {sorted.length === 0 ? <p className={css.empty}>Add words, photos, swatches or shapes with the buttons above.</p> : null}
        {sorted.map((it) => {
          const on = it.id === selected;
          const box: CSSProperties = { left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, height: `${it.h}%`, rotate: it.rotate ? `${it.rotate}deg` : undefined, zIndex: it.z };
          if (it.kind === "text") Object.assign(box, { height: "auto", minHeight: `${it.h}%` });
          if (it.kind === "swatch") box.height = "auto";
          return (
            <div
              key={it.id}
              data-item={it.id}
              className={`${css.item} ${it.kind === "photo" ? css.photo : ""}`}
              data-selected={on || undefined}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={describe(it, collections)}
              style={box}
              onPointerDown={(e) => begin(e, it, "move")}
              onFocus={() => {
                if (!on) onSelect(it.id);
              }}
              onKeyDown={(e) => onKey(e, it)}
            >
              <ItemView it={it} collections={collections} />
              {on && !readOnly ? (
                <>
                  <span className={css.resize} aria-hidden="true" title="Drag to resize. Hold Shift to keep its shape." onPointerDown={(e) => begin(e, it, "resize")} />
                  <span className={css.turn} aria-hidden="true" title="Drag to turn. Hold Shift for steps of 15 degrees." onPointerDown={(e) => begin(e, it, "rotate")} />
                </>
              ) : null}
            </div>
          );
        })}
        {guides.v !== undefined ? <span className={css.guideV} style={{ left: `${guides.v}%` }} aria-hidden="true" /> : null}
        {guides.h !== undefined ? <span className={css.guideH} style={{ top: `${guides.h}%` }} aria-hidden="true" /> : null}
      </div>
    </div>
  );
}

/** One item, drawn as the block draws it on the page. */
function ItemView({ it, collections }: { it: CanvasItem; collections: Collection[] }) {
  if (it.kind === "text") {
    return (
      <p className={blockStyles.canvasText} data-style={it.textStyle ?? "body"} style={{ fontSize: `${it.fontSize ?? 2}cqi`, textAlign: it.align ?? "start" }}>
        {it.text || "\u00a0"}
      </p>
    );
  }
  if (it.kind === "photo") {
    const p = it.photo;
    return (
      <span className={blockStyles.canvasPhoto} data-frame={it.frame ?? "plain"} style={{ backgroundColor: p?.color, backgroundImage: p?.blur ? `url("${p.blur}")` : undefined, backgroundSize: "cover" }}>
        {p?.src ? (
          <img src={asset(p.src)} alt="" draggable={false} style={{ objectPosition: p.focus ? `${p.focus.x}% ${p.focus.y}%` : undefined }} />
        ) : (
          <span className={css.photoEmpty}>
            <ImageSquareIcon size={22} aria-hidden="true" />
          </span>
        )}
      </span>
    );
  }
  if (it.kind === "swatch") {
    const sw = it.pick ? pickToSwatch(collections, it.pick) : null;
    if (!sw?.chip?.src) return <span className={css.swatchEmpty} />;
    const tilt = ((((it.z ?? 0) * 37) % 7) - 3) * 0.35;
    return (
      <span className={css.lift} style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
        <span className={css.cloth} style={{ backgroundColor: sw.chip.color }}>
          <img src={asset(sw.chip.src)} alt="" draggable={false} />
        </span>
      </span>
    );
  }
  return <span className={css.shape} style={{ background: it.color ?? "var(--board-deep)" }} />;
}

// -------------------------------------------------------------- properties

function Properties({
  id,
  it,
  shades,
  collections,
  readOnly,
  onPatch,
  onLive,
  onDone,
  onChoosePhoto,
}: {
  id: string;
  it: CanvasItem;
  shades: Shade[];
  collections: Collection[];
  readOnly?: boolean;
  onPatch: (p: Partial<CanvasItem>) => void;
  onLive: (p: Partial<CanvasItem>) => void;
  onDone: () => void;
  onChoosePhoto: () => void;
}) {
  const ids = useId();
  const turnId = `${ids}-turn`;
  const sizeId = `${ids}-size`;

  return (
    <fieldset className={css.props} disabled={readOnly || undefined} style={{ margin: 0, minWidth: 0 }}>
      <div className={css.propsHead}>
        <h3 className={ui.caps}>{KIND_NAME[it.kind]}</h3>
      </div>

      {it.kind === "text" ? (
        <>
          <TextArea label="Words" value={it.text ?? ""} rows={3} onChange={(v) => onPatch({ text: v })} />
          <Field label="Style">
            <Segmented<NonNullable<CanvasItem["textStyle"]>>
              label="Style"
              value={it.textStyle ?? "body"}
              onChange={(v) => onPatch({ textStyle: v })}
              options={[
                { label: "Display", value: "display" },
                { label: "Body", value: "body" },
                { label: "Tagline", value: "tagline" },
                { label: "Label", value: "label" },
              ]}
            />
          </Field>
          <Field label="Size" htmlFor={sizeId} hint="A share of the board's width, so words keep their size as the board grows or shrinks.">
            <div className={css.row}>
              <input
                id={sizeId}
                className={css.range}
                type="range"
                min={1}
                max={12}
                step={0.25}
                value={it.fontSize ?? 2}
                onChange={(e) => onLive({ fontSize: Number(e.currentTarget.value) })}
                onPointerUp={onDone}
                onKeyUp={onDone}
                onBlur={onDone}
              />
              <output className={css.value} htmlFor={sizeId}>
                {(it.fontSize ?? 2).toFixed(it.fontSize && it.fontSize % 1 ? 2 : 0)}
              </output>
            </div>
          </Field>
          <Field label="Align">
            <Segmented<NonNullable<CanvasItem["align"]>>
              label="Align"
              value={it.align ?? "start"}
              onChange={(v) => onPatch({ align: v })}
              options={[
                { label: "Left", value: "start" },
                { label: "Centre", value: "center" },
                { label: "Right", value: "end" },
              ]}
            />
          </Field>
        </>
      ) : null}

      {it.kind === "photo" ? (
        <>
          <div className={css.row}>
            <span className={css.thumb} style={{ backgroundColor: it.photo?.color, backgroundImage: it.photo?.blur ? `url("${it.photo.blur}")` : undefined }}>
              {it.photo?.src ? <img src={asset(it.photo.src)} alt="" /> : null}
            </span>
            <Button size="s" onClick={onChoosePhoto}>
              {it.photo?.src ? "Change photo" : "Choose photo"}
            </Button>
          </div>
          <Field label="Frame">
            <Segmented<NonNullable<CanvasItem["frame"]>>
              label="Frame"
              value={it.frame ?? "plain"}
              onChange={(v) => onPatch({ frame: v })}
              options={[
                { label: "Plain", value: "plain" },
                { label: "Card", value: "card" },
                { label: "Mounted", value: "mounted" },
              ]}
            />
          </Field>
        </>
      ) : null}

      {it.kind === "swatch" ? (
        ColourwayControl ? (
          <ColourwayControl field={{ label: "Colourway", metadata: { kind: "colourway" } }} name="pick" id={`${id}-${it.id}-pick`} value={it.pick ?? ""} onChange={(v: string | null) => onPatch({ pick: v ?? "" })} readOnly={readOnly} />
        ) : (
          <Field label="Colourway" htmlFor={`${ids}-pick`}>
            <select id={`${ids}-pick`} className={ui.select} value={it.pick ?? ""} onChange={(e) => onPatch({ pick: e.currentTarget.value })}>
              <option value="">Choose a colourway</option>
              {collections.map((c) => (
                <optgroup key={c.slug} label={c.name}>
                  {(c.designs ?? []).flatMap((d) =>
                    (d.colourways ?? []).filter(isComplete).map((k) => (
                      <option key={`${d.slug}/${k.id}`} value={`${c.slug}/${d.slug}/${k.id}`}>
                        {d.name}, {k.name}
                      </option>
                    )),
                  )}
                </optgroup>
              ))}
            </select>
          </Field>
        )
      ) : null}

      {it.kind === "shape" ? (
        <Field label="Colour">
          <div className={css.colours} role="group" aria-label="Colour">
            {shades.map((s) => (
              <button
                key={s.id}
                type="button"
                className={css.colour}
                style={{ backgroundColor: s.hex }}
                aria-pressed={s.hex.toLowerCase() === (it.color ?? "").toLowerCase()}
                aria-label={s.name}
                title={`${s.name}, ${s.hex}`}
                onClick={() => onPatch({ color: s.hex })}
              />
            ))}
            <input
              type="color"
              className={css.colourInput}
              value={/^#[0-9a-f]{6}$/i.test(it.color ?? "") ? (it.color as string) : "#6a2222"}
              aria-label="Choose any colour"
              title="Choose any colour"
              onChange={(e) => onPatch({ color: e.currentTarget.value })}
            />
          </div>
        </Field>
      ) : null}

      <Field label="Turn (degrees)" htmlFor={turnId} hint="From -45 to 45. You can also drag the handle above it.">
        <input
          id={turnId}
          className={`${ui.input} ${css.number}`}
          type="number"
          min={-TURN}
          max={TURN}
          step={1}
          value={Math.round(it.rotate ?? 0)}
          onChange={(e) => {
            const v = Number(e.currentTarget.value);
            if (Number.isFinite(v)) onPatch({ rotate: clamp(Math.round(v), -TURN, TURN) });
          }}
        />
      </Field>
    </fieldset>
  );
}

export default artboard;
