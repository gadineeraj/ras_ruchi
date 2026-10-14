"use client";

// A colour from her palette, a surface (card stock or board) for section
// backgrounds, or any custom colour, which she can save to the palette.
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { EyedropperIcon } from "@phosphor-icons/react/dist/ssr/Eyedropper";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { onShade } from "@/blocks/shared";
import { slugify } from "@/lib/library";
import { useStudio } from "../state";
import { Button, IconButton, ui } from "../ui";
import { FieldShell } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

type Opts = { allowNone?: boolean; surfaces?: boolean };
type Tile = { key: string; name: string; value: string; hex?: string };

const SURFACES: Tile[] = [
  { key: "card", name: "Card stock", value: "card", hex: "#f4f4f1" },
  { key: "board", name: "Board", value: "board", hex: "#c9c9c3" },
];

const HEX = /^#[0-9a-f]{6}$/i;

/** "#ABC", "abc123" or "rgb(1, 2, 3)" → "#aabbcc" style, or null. */
function toHex(input: string): string | null {
  const v = input.trim().toLowerCase();
  const rgb = /^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(v);
  if (rgb) return `#${rgb.slice(1, 4).map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0")).join("")}`;
  const bare = v.replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(bare)) return `#${[...bare].map((c) => c + c).join("")}`;
  if (/^[0-9a-f]{6}$/.test(bare)) return `#${bare}`;
  return null;
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };
const noSubscribe = () => () => {};

export function ShadeField({ field, name, id, value, onChange, readOnly }: FieldProps<string | null | undefined, Opts>) {
  const { content, setSite, toast } = useStudio();
  const opts = field.metadata ?? ({} as Opts);
  // Section and canvas backgrounds can also be card stock or board.
  const surfaces = opts.surfaces ?? /(^|\.)background$/i.test(name);
  const current = (value ?? "").trim().toLowerCase() || (opts.allowNone ? "none" : "");
  const shades = content.site.shades ?? [];
  const tiles: Tile[] = [
    ...(opts.allowNone ? [{ key: "none", name: "None", value: "none" }] : []),
    ...(surfaces ? SURFACES : []),
    ...shades.map((s) => ({ key: s.id, name: s.name, value: s.hex.toLowerCase(), hex: s.hex })),
  ];
  const isHex = HEX.test(current);
  const inPalette = isHex && shades.some((s) => s.hex.toLowerCase() === current);
  const custom = isHex && !tiles.some((t) => t.value === current);
  const labelId = `${id}-label`;

  // The hex box follows the value, but holds what she types until it is a colour.
  const [draft, setDraft] = useState(isHex ? current : "");
  const [seen, setSeen] = useState(current);
  if (seen !== current) {
    setSeen(current);
    setDraft(isHex ? current : "");
  }
  const draftBad = draft.trim() !== "" && toHex(draft) === null;

  const canPick = useSyncExternalStore(noSubscribe, () => "EyeDropper" in window, () => false);
  const pickFromScreen = async () => {
    try {
      const Dropper = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
      const { sRGBHex } = await new Dropper().open();
      const hex = toHex(sRGBHex);
      if (hex) onChange(hex);
    } catch {
      // She pressed Escape; nothing to do.
    }
  };

  const [naming, setNaming] = useState(false);
  const [shadeName, setShadeName] = useState("");
  const saveToPalette = () => {
    const label = shadeName.trim() || current;
    setSite((s) => {
      const list = s.shades ?? [];
      const base = slugify(label) || "shade";
      let key = base;
      for (let n = 2; list.some((x) => x.id === key); n++) key = `${base}-${n}`;
      return { ...s, shades: [...list, { id: key, name: label, hex: current }] };
    });
    toast(`${label} is in your palette now.`, { tone: "success" });
    setNaming(false);
    setShadeName("");
  };

  return (
    <FieldShell label={field.label} labelId={labelId} readOnly={readOnly}>
      <div className={css.swatches} role="group" aria-labelledby={labelId}>
        {tiles.map((t) => {
          const on = t.value === current;
          return (
            <button key={t.key} type="button" className={css.shadeTile} aria-pressed={on} title={t.hex ? `${t.name} ${t.hex}` : t.name} onClick={() => onChange(t.value)}>
              <span className={css.shadeChip} data-none={t.value === "none" || undefined} style={{ backgroundColor: t.hex, color: t.hex && onShade(t.hex) === "dark" ? "#1b1a14" : "#f7f3ee" } as CSSProperties}>
                {on ? <CheckIcon size={14} weight="bold" aria-hidden="true" /> : null}
              </span>
              <span className={css.shadeName}>{t.name}</span>
            </button>
          );
        })}
      </div>

      <div className={`${css.sub} ${css.customBlock}`}>
        <span className={ui.label} id={`${id}-custom`}>
          Custom colour
        </span>
        <div className={css.customRow} data-on={custom || undefined}>
          <input
            type="color"
            className={css.colorWell}
            value={isHex ? current : (tiles.find((t) => t.value === current)?.hex ?? "#d6d6d1").toLowerCase()}
            aria-label="Choose a custom colour"
            onChange={(e) => onChange(e.currentTarget.value.toLowerCase())}
          />
          <input
            className={`${ui.input} ${css.hexInput}`}
            value={draft}
            placeholder="#6a2222"
            spellCheck={false}
            autoComplete="off"
            aria-label="Colour code"
            aria-invalid={draftBad || undefined}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setDraft(v);
              const hex = toHex(v);
              if (hex && v.replace(/^#/, "").length === 6) onChange(hex);
            }}
            onBlur={() => {
              const hex = toHex(draft);
              if (hex) {
                setDraft(hex);
                if (hex !== current) onChange(hex);
              }
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const hex = toHex(draft);
              if (hex) onChange(hex);
            }}
          />
          {canPick ? <IconButton label="Pick from screen" icon={<EyedropperIcon size={18} />} onClick={pickFromScreen} /> : null}
        </div>
        {draftBad ? <p className={ui.error}>Use a colour code like #6a2222.</p> : null}

        {isHex && !inPalette ? (
          naming ? (
            <div className={css.nameRow}>
              <input
                className={ui.input}
                value={shadeName}
                placeholder="Name it, e.g. Kolam green"
                aria-label="Name for the new palette colour"
                autoFocus
                onChange={(e) => setShadeName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveToPalette();
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setNaming(false);
                  }
                }}
              />
              <Button size="s" variant="primary" onClick={saveToPalette}>
                Save
              </Button>
              <Button size="s" variant="ghost" onClick={() => setNaming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="s" variant="ghost" icon={<PlusIcon size={14} aria-hidden="true" />} onClick={() => setNaming(true)} className={css.alignStart}>
              Save to palette
            </Button>
          )
        ) : null}
      </div>
    </FieldShell>
  );
}
