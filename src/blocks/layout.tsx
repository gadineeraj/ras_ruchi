import type { CSSProperties } from "react";
import { Swatch } from "@/components/Swatch";
import type { Photo } from "@/lib/content-types";
import { pickToSwatch } from "@/lib/library";
import { f, opts } from "./fields";
import { counts, display, filled, Frame, onShade, Pic, ratioCss, type LayoutProps, type Ratio, type TextValue } from "./shared";
import type { PuckBits, SlotRender } from "./types";
import styles from "./blocks.module.css";

type L = { layout: LayoutProps };

const SLOT = "bx-slot";

/** Colours a surface: card stock, a deeper board, or a shade from her palette. */
function surface(bg: string): { attr: string | undefined; style: CSSProperties | undefined } {
  if (!bg || bg === "none") return { attr: undefined, style: undefined };
  if (bg === "card" || bg === "board") return { attr: bg, style: undefined };
  const on = onShade(bg);
  return { attr: "shade", style: { "--shade": bg, "--on-shade": on === "light" ? "#f7f3ee" : "#1b1a14" } as CSSProperties };
}

// ----------------------------------------------------------------- Section

type SectionProps = L & { title: TextValue; lede: TextValue; level: "h1" | "h2"; align: "start" | "center"; background: string; hole: boolean; content: SlotRender };

export const Section = {
  label: "Section",
  description: "A heading and introduction with room for any blocks below it.",
  keywords: ["container", "group", "area", "wrapper", "heading"],
  fields: {
    title: f.text("Heading", { inline: true }),
    lede: f.textarea("Introduction", { inline: true }),
    level: f.choice("Heading is", [
      { label: "Section", value: "h2" },
      { label: "Page title", value: "h1" },
    ]),
    align: f.choice("Align heading", opts.align),
    background: f.shade("Background", { allowNone: true }),
    hole: f.toggle("Punched hole", "Shows the shade card's ring hole when the section has a background."),
    content: f.slot(),
    layout: f.layout(),
  },
  defaultProps: { title: "A new section", lede: "", level: "h2", align: "start", background: "none", hole: true, content: [], layout: { width: "wide", space: "xl", show: "all", motion: "none" } },
  render: ({ title, lede, level, align, background, hole, content: Content, layout, puck }: SectionProps & PuckBits) => {
    const Tag = level;
    const bg = surface(background);
    return (
      <Frame layout={layout} as="section" label={typeof title === "string" ? title : undefined}>
        <div className={styles.surface} data-bg={bg.attr} style={bg.style}>
          {bg.attr && bg.attr !== "board" && hole ? <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" /> : null}
          {filled(title) || filled(lede) ? (
            <header className={styles.sectionHead} data-align={align}>
              {filled(title) ? <Tag className="t-display">{display(counts(title, puck.metadata))}</Tag> : null}
              {filled(lede) ? <p className={`t-lead ${styles.lede}`}>{counts(lede, puck.metadata)}</p> : null}
            </header>
          ) : null}
          <Content className={SLOT} minEmptyHeight={120} />
        </div>
      </Frame>
    );
  },
};

// ----------------------------------------------------------------- Columns

const COLUMN_SETS: Record<string, string> = {
  "1:1": "repeat(2, minmax(0, 1fr))",
  "2:1": "minmax(0, 2fr) minmax(0, 1fr)",
  "1:2": "minmax(0, 1fr) minmax(0, 2fr)",
  "7:5": "minmax(0, 7fr) minmax(0, 5fr)",
  "5:7": "minmax(0, 5fr) minmax(0, 7fr)",
  "1:1:1": "repeat(3, minmax(0, 1fr))",
  "2:1:1": "minmax(0, 2fr) repeat(2, minmax(0, 1fr))",
  "1:1:1:1": "repeat(4, minmax(0, 1fr))",
};

type ColumnsProps = L & {
  split: keyof typeof COLUMN_SETS;
  gap: "s" | "m" | "l";
  valign: "start" | "center" | "end";
  mobile: "stack" | "reverse" | "keep";
  one: SlotRender;
  two: SlotRender;
  three: SlotRender;
  four: SlotRender;
};

export const Columns = {
  label: "Columns",
  description: "Two to four columns side by side. Drop any blocks into each.",
  keywords: ["grid", "side by side", "split", "two columns", "layout", "image and text"],
  fields: {
    split: f.choice("Columns", [
      { label: "½ ½", value: "1:1" },
      { label: "⅔ ⅓", value: "2:1" },
      { label: "⅓ ⅔", value: "1:2" },
      { label: "7 · 5", value: "7:5" },
      { label: "5 · 7", value: "5:7" },
      { label: "⅓ ⅓ ⅓", value: "1:1:1" },
      { label: "½ ¼ ¼", value: "2:1:1" },
      { label: "¼ × 4", value: "1:1:1:1" },
    ]),
    gap: f.choice("Gap", [
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
    ]),
    valign: f.choice("Line up", [
      { label: "Top", value: "start" },
      { label: "Middle", value: "center" },
      { label: "Bottom", value: "end" },
    ]),
    mobile: f.choice("On phones", [
      { label: "Stack", value: "stack" },
      { label: "Stack, second first", value: "reverse" },
      { label: "Keep side by side", value: "keep" },
    ]),
    one: f.slot(),
    two: f.slot(),
    three: f.slot(),
    four: f.slot(),
    layout: f.layout(),
  },
  defaultProps: { split: "1:1", gap: "m", valign: "start", mobile: "stack", one: [], two: [], three: [], four: [], layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ split, gap, valign, mobile, one: One, two: Two, three: Three, four: Four, layout }: ColumnsProps & PuckBits) => {
    const count = split.split(":").length;
    const slots = [One, Two, Three, Four].slice(0, count);
    return (
      <Frame layout={layout}>
        <div className={styles.columns} data-gap={gap} data-mobile={mobile} style={{ "--cols": COLUMN_SETS[split] ?? COLUMN_SETS["1:1"], "--col-align": valign } as CSSProperties}>
          {slots.map((Slot, i) => (
            <Slot key={i} className={`${styles.column} ${SLOT}`} minEmptyHeight={140} />
          ))}
        </div>
      </Frame>
    );
  },
};

// -------------------------------------------------------------------- Card

type CardProps = L & { band: string; bandTitle: TextValue; bandNote: TextValue; hole: boolean; pad: "s" | "m" | "l"; content: SlotRender };

export const Card = {
  label: "Highlight card",
  description: "Content on a sheet of card stock with a punched hole, optionally headed by a printed colour band.",
  keywords: ["box", "panel", "highlight", "callout", "text box", "card", "band"],
  fields: {
    band: f.shade("Band colour", { allowNone: true }),
    bandTitle: f.text("Band heading", { inline: true }),
    bandNote: f.text("Band note", { inline: true }),
    hole: f.toggle("Punched hole"),
    pad: f.choice("Inner space", [
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
    ]),
    content: f.slot(),
    layout: f.layout(),
  },
  defaultProps: { band: "none", bandTitle: "", bandNote: "", hole: true, pad: "m", content: [], layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ band, bandTitle, bandNote, hole, pad, content: Content, layout }: CardProps & PuckBits) => {
    const hasBand = band && band !== "none";
    const style = hasBand ? ({ "--shade": band, "--on-shade": onShade(band) === "light" ? "#f7f3ee" : "#1b1a14" } as CSSProperties) : undefined;
    return (
      <Frame layout={layout}>
        <div className={styles.card} data-pad={pad} style={style}>
          {hasBand ? (
            <div className={styles.cardBand}>
              {hole ? <span className="card-hole" style={{ top: 14, left: 14 }} aria-hidden="true" /> : null}
              {filled(bandTitle) ? <h2>{display(bandTitle)}</h2> : <span />}
              {filled(bandNote) ? <span className="t-label">{bandNote}</span> : null}
            </div>
          ) : hole ? (
            <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
          ) : null}
          <div className={`${styles.cardBody} ${!hasBand ? styles.cardNoBand : ""}`}>
            <Content className={SLOT} minEmptyHeight={120} />
          </div>
        </div>
      </Frame>
    );
  },
};

// ------------------------------------------------------------ Spacer, Rule

export const Spacer = {
  label: "Space",
  description: "Empty space between blocks.",
  keywords: ["gap", "padding", "margin", "breathing room"],
  fields: {
    size: f.choice("Height", [
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
    ]),
  },
  defaultProps: { size: "m" },
  render: ({ size }: { size: string } & PuckBits) => <div className={styles.spacer} data-size={size} aria-hidden="true" />,
};

type RuleProps = L & { style: "hair" | "strong" | "ink" };

export const Divider = {
  label: "Line",
  description: "A printed rule across the page.",
  keywords: ["divider", "rule", "separator", "hr", "line"],
  fields: {
    style: f.choice("Weight", [
      { label: "Hairline", value: "hair" },
      { label: "Strong", value: "strong" },
      { label: "Ink", value: "ink" },
    ]),
    layout: f.layout(),
  },
  defaultProps: { style: "strong", layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ style, layout }: RuleProps & PuckBits) => (
    <Frame layout={layout}>
      <hr className={styles.rule} data-style={style} />
    </Frame>
  ),
};

// ------------------------------------------------------------- Free canvas

export type CanvasItem = {
  id: string;
  kind: "text" | "photo" | "swatch" | "shape";
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  z: number;
  text?: string;
  textStyle?: "display" | "body" | "tagline" | "label";
  /** Text size as a share of the canvas width, so it scales with it. */
  fontSize?: number;
  align?: "start" | "center" | "end";
  photo?: Photo | null;
  frame?: "plain" | "card" | "mounted";
  pick?: string;
  color?: string;
};

type CanvasProps = L & { ratio: Ratio; background: string; items: CanvasItem[]; mobile: "scale" | "stack"; label: string };

export const FreeCanvas = {
  label: "Free canvas",
  description: "Place photos, words and swatches anywhere, overlap them and turn them, like a mood board. It scales down whole on phones.",
  keywords: ["collage", "mood board", "freeform", "artboard", "canva", "position", "overlap"],
  fields: {
    items: f.artboard("Arrange"),
    ratio: f.select("Shape", opts.ratio.filter((o) => o.value !== "auto")),
    background: f.shade("Background", { allowNone: true }),
    mobile: f.choice("On phones", [
      { label: "Scale down", value: "scale" },
      { label: "Stack in order", value: "stack" },
    ]),
    label: f.text("Describe it", { placeholder: "For screen readers, e.g. Mood board for Ratna" }),
    layout: f.layout(),
  },
  defaultProps: {
    ratio: "16:9",
    background: "card",
    mobile: "scale",
    label: "",
    items: [
      { id: "t1", kind: "text", x: 6, y: 10, w: 44, h: 20, rotate: 0, z: 2, text: "A mood board", textStyle: "display", fontSize: 6, align: "start" },
      { id: "s1", kind: "shape", x: 58, y: 14, w: 30, h: 62, rotate: 2, z: 1, color: "#6a2222" },
    ],
    layout: { width: "wide", space: "m", show: "all", motion: "none" },
  },
  render: ({ ratio, background, items, mobile, label, layout, puck }: CanvasProps & PuckBits) => {
    const bg = surface(background);
    const sorted = [...(items ?? [])].sort((a, b) => a.z - b.z);
    return (
      <Frame layout={layout}>
        <div className={styles.canvas} data-bg={bg.attr} data-mobile={mobile} role="img" aria-label={label || undefined} style={{ aspectRatio: ratioCss(ratio), ...bg.style }}>
          {sorted.map((it) => {
            const box: CSSProperties = { left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, height: `${it.h}%`, rotate: it.rotate ? `${it.rotate}deg` : undefined, zIndex: it.z };
            if (it.kind === "text") {
              return (
                <div key={it.id} className={styles.canvasItem} data-kind="text" style={{ ...box, height: "auto", minHeight: `${it.h}%` }}>
                  <p className={styles.canvasText} data-style={it.textStyle ?? "body"} style={{ fontSize: `${it.fontSize ?? 2}cqi`, textAlign: it.align ?? "start" }}>
                    {it.text}
                  </p>
                </div>
              );
            }
            if (it.kind === "photo") {
              return (
                <div key={it.id} className={styles.canvasItem} data-kind="photo" style={{ ...box, "--item-ratio": it.photo ? `${it.photo.width} / ${it.photo.height}` : undefined } as CSSProperties}>
                  <span className={styles.canvasPhoto} data-frame={it.frame ?? "plain"} style={{ backgroundColor: it.photo?.color }}>
                    <Pic photo={it.photo} sizes={`${Math.round(it.w)}vw`} />
                  </span>
                </div>
              );
            }
            if (it.kind === "swatch") {
              const sw = it.pick ? pickToSwatch(puck.metadata.collections, it.pick) : null;
              return (
                <div key={it.id} className={styles.canvasItem} data-kind="swatch" style={{ ...box, height: "auto", "--item-ratio": "1 / 1" } as CSSProperties}>
                  {sw ? <Swatch chip={sw.chip} index={it.z} sizes={`${Math.round(it.w)}vw`} alt={`${sw.design} in ${sw.colourway}`} /> : <span className={styles.picEmpty} />}
                </div>
              );
            }
            return <div key={it.id} className={styles.canvasItem} data-kind="shape" aria-hidden="true" style={{ ...box, background: it.color ?? "var(--board-deep)" }} />;
          })}
        </div>
      </Frame>
    );
  },
};

export const layoutBlocks = { Section, Columns, Card, Spacer, Divider, FreeCanvas };
