"use client";

import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { createContext, use, useState, type KeyboardEvent, type ReactNode } from "react";
import type { SwatchItem } from "@/lib/library";
import { asset } from "@/lib/paths";
import { seenAs } from "@/lib/format";
import { Swatch } from "./Swatch";
import styles from "./SwatchPicker.module.css";

// A row of swatches and a viewing window. Lifting a swatch (click, tap, Enter,
// arrows) lays it beside the card and shows that cloth hanging in a room.

type PickerState = {
  items: SwatchItem[];
  selected: SwatchItem | undefined;
  warmed: ReadonlySet<string>;
  select: (id: string) => void;
  warm: (id: string) => void;
  label: string;
};

const PickerContext = createContext<PickerState | null>(null);

function usePicker() {
  const ctx = use(PickerContext);
  if (!ctx) throw new Error("Swatch picker parts must sit inside <SwatchPicker>.");
  return ctx;
}

export function SwatchPicker({ items, label, children }: { items: SwatchItem[]; label: string; children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  // Only photos someone has shown interest in are mounted, so a row of ten
  // swatches does not download ten room photographs up front.
  const [warmed, setWarmed] = useState<ReadonlySet<string>>(() => new Set(items[0] ? [items[0].id] : []));

  const warm = (id: string) => setWarmed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  const select = (id: string) => {
    warm(id);
    setSelectedId(id);
  };
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  return <PickerContext value={{ items, selected, warmed, select, warm, label }}>{children}</PickerContext>;
}

export function SwatchWindow({ sizes, className, preload = false }: { sizes: string; className?: string; preload?: boolean }) {
  const { items, selected, warmed } = usePicker();
  return (
    <div className={`${styles.window} ${className ?? ""}`}>
      {items
        .filter((item) => warmed.has(item.id) || item.id === selected?.id)
        .map((item) => (
          <Image
            key={item.id}
            src={asset(item.view.src)}
            alt={`${item.design} in ${item.colourway}, as ${seenAs(item.seenAs)}`}
            fill
            sizes={sizes}
            quality={82}
            placeholder="blur"
            blurDataURL={item.view.blur}
            preload={preload && item.id === items[0].id}
            className={styles.view}
            style={{ objectPosition: item.seenAs === "Blind" ? "50% 16%" : "50% 45%" }}
            data-active={item.id === selected?.id || undefined}
            aria-hidden={item.id !== selected?.id || undefined}
          />
        ))}
    </div>
  );
}

type ChipLabels = "design" | "colourway";

export function SwatchChips({ className, sizes, labels = "design" }: { className?: string; sizes: string; labels?: ChipLabels }) {
  const { items, selected, select, warm, label } = usePicker();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (index + 1) % items.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (index - 1 + items.length) % items.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    select(items[next].id);
    const group = event.currentTarget.parentElement;
    (group?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={`${styles.chips} ${className ?? ""}`}>
      {items.map((item, i) => {
        const checked = item.id === selected?.id;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={styles.chip}
            onClick={() => select(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onPointerEnter={() => warm(item.id)}
            onFocus={() => warm(item.id)}
          >
            <Swatch chip={item.chip} index={i} sizes={sizes} />
            <span className={styles.labels}>
              {labels === "design" ? <span className="t-label">{item.design}</span> : null}
              <span className={styles.colourway}>{item.colourway}</span>
              <span className="t-shade" aria-hidden="true">
                Ground {item.chip.shade}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The selected swatch's name, collection and how it is sold. */
export function SwatchCaption({ className }: { className?: string }) {
  const { selected } = usePicker();
  if (!selected) return null;
  return (
    <p className={`${styles.caption} ${className ?? ""}`} aria-live="polite">
      <span className={styles.captionName}>
        {selected.design} in {selected.colourway}
      </span>
      <span>
        As {seenAs(selected.seenAs)}. {selected.collection}, {selected.season}.
      </span>
    </p>
  );
}

/** Opens the selected colourway at The Yellow Dwelling. */
export function SwatchShopLink({ className, shopName = "The Yellow Dwelling" }: { className?: string; shopName?: string }) {
  const { selected } = usePicker();
  if (!selected?.href) return null;
  return (
    <a className={`t-label ${styles.shop} ${className ?? ""}`} href={selected.href} target="_blank" rel="noopener">
      {selected.colourway} at {shopName}
      <ArrowUpRightIcon size={13} weight="bold" aria-hidden="true" />
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
