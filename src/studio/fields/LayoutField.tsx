"use client";

// How a block sits on the page: its width and the space above it, then, under
// "More", which screens show it, how it enters, its anchor name and hiding it.
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { useState, type FocusEvent, type PointerEvent } from "react";
import type { LayoutProps, Motion, Show, Space, Width } from "@/blocks/shared";
import { useStudio } from "../state";
import { Segmented, Switch, ui } from "../ui";
import { clean, FieldShell } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

type Opts = { widths?: string[]; spaces?: string[] };

const WIDTHS: { label: string; value: Width; hint: string }[] = [
  { label: "Full", value: "full", hint: "Full: edge to edge, the whole width of the window." },
  { label: "Wide", value: "wide", hint: "Wide: the page's main column, with margins either side." },
  { label: "Text", value: "text", hint: "Text: a comfortable width for reading." },
  { label: "Narrow", value: "narrow", hint: "Narrow: a slim column, for a quote or a small photo." },
];

const SPACES: { label: string; value: Space; title: string }[] = [
  { label: "None", value: "none", title: "No space" },
  { label: "XS", value: "xs", title: "Extra small" },
  { label: "S", value: "s", title: "Small" },
  { label: "M", value: "m", title: "Medium" },
  { label: "L", value: "l", title: "Large" },
  { label: "XL", value: "xl", title: "Extra large" },
];

const SHOWS: { label: string; value: Show }[] = [
  { label: "Every screen", value: "all" },
  { label: "Desktop only", value: "desktop" },
  { label: "Phone only", value: "mobile" },
];

const MOTIONS: { label: string; value: Motion }[] = [
  { label: "None", value: "none" },
  { label: "Rise", value: "rise" },
  { label: "Fade", value: "fade" },
];

const DEFAULTS: Required<Pick<LayoutProps, "width" | "space" | "show" | "motion">> = { width: "wide", space: "m", show: "all", motion: "none" };

const typingSlug = (v: string) =>
  v
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");

/** Index of the segmented button under the pointer or focus, else -1. */
function buttonIndex(target: EventTarget | null): number {
  const btn = (target as HTMLElement | null)?.closest?.("button");
  return btn?.parentElement ? Array.from(btn.parentElement.children).indexOf(btn) : -1;
}

export function LayoutField({ field, id, value, onChange, readOnly }: FieldProps<LayoutProps | null | undefined, Opts>) {
  const { meta } = useStudio();
  const layout = { ...DEFAULTS, ...(value ?? {}) };
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(-1);

  const widths = field.metadata?.widths?.length ? WIDTHS.filter((w) => field.metadata!.widths!.includes(w.value)) : WIDTHS;
  const spaces = field.metadata?.spaces?.length ? SPACES.filter((s) => field.metadata!.spaces!.includes(s.value)) : SPACES;

  const set = (patch: Partial<LayoutProps>) => onChange(clean({ ...layout, ...patch }));

  const widthHint = (widths[hovered] ?? widths.find((w) => w.value === layout.width) ?? widths[0])?.hint;
  const track = {
    onPointerOver: (e: PointerEvent) => setHovered(buttonIndex(e.target)),
    onPointerLeave: () => setHovered(-1),
    onFocus: (e: FocusEvent) => setHovered(buttonIndex(e.target)),
    onBlur: () => setHovered(-1),
  };

  const extras = [
    layout.show === "desktop" ? "Desktop only" : layout.show === "mobile" ? "Phone only" : null,
    layout.motion === "rise" ? "Rises in" : layout.motion === "fade" ? "Fades in" : null,
    layout.anchor ? `#${layout.anchor}` : null,
    layout.hidden ? "Hidden" : null,
  ].filter(Boolean);

  return (
    <FieldShell label={field.label} labelId={`${id}-label`} readOnly={readOnly}>
      <div className={css.layout} data-field-kind="layout">
        {widths.length > 1 ? (
          <div className={css.sub}>
            <span className={ui.label} id={`${id}-width`}>
              Width
            </span>
            <div {...track}>
              <Segmented<Width> label="Width" value={layout.width} options={widths} onChange={(width) => set({ width })} />
            </div>
            <p className={ui.hint} aria-live="polite">
              {widthHint}
            </p>
          </div>
        ) : null}

        {spaces.length > 1 ? (
          <div className={css.sub}>
            <span className={ui.label} id={`${id}-space`}>
              Space above
            </span>
            <Segmented<Space> label="Space above" value={layout.space} options={spaces} onChange={(space) => set({ space })} />
          </div>
        ) : null}

        {layout.hidden ? (
          <div className={css.hiddenNote}>
            <EyeSlashIcon size={16} aria-hidden="true" />
            <span>Hidden from the published site.</span>
            <button type="button" className={css.textButton} onClick={() => set({ hidden: undefined })}>
              Show it
            </button>
          </div>
        ) : null}

        <div className={css.disclosure}>
          <button type="button" className={css.moreToggle} aria-expanded={open} aria-controls={`${id}-more`} onClick={() => setOpen((o) => !o)}>
            <CaretRightIcon className={css.caret} size={14} weight="bold" aria-hidden="true" />
            <span>More</span>
            {!open && extras.length ? <span className={css.moreSummary}>{extras.join(", ")}</span> : null}
          </button>
          {open ? (
            <div id={`${id}-more`} className={css.moreBody}>
              <div className={css.sub}>
                <span className={ui.label}>Show on</span>
                <Segmented<Show> label="Show on" value={layout.show} options={SHOWS} onChange={(show) => set({ show })} />
              </div>
              <div className={css.sub}>
                <span className={ui.label}>Entrance</span>
                <Segmented<Motion> label="Entrance" value={layout.motion} options={MOTIONS} onChange={(motion) => set({ motion })} />
                <p className={ui.hint}>Plays once as the block scrolls into view; switched off for visitors who prefer less motion.</p>
              </div>
              <div className={css.sub}>
                <label className={ui.label} htmlFor={`${id}-anchor`}>
                  Anchor name
                </label>
                <input
                  id={`${id}-anchor`}
                  className={ui.input}
                  value={layout.anchor ?? ""}
                  placeholder="e.g. contact"
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => set({ anchor: typingSlug(e.currentTarget.value) || undefined })}
                  onBlur={() => {
                    const tidy = layout.anchor?.replace(/^-+|-+$/g, "") || undefined;
                    if (tidy !== layout.anchor) set({ anchor: tidy });
                  }}
                />
                <p className={ui.hint}>
                  Lets a link jump here: {meta.page.path}#{layout.anchor || "name"}
                </p>
              </div>
              <Switch label="Hide from the published site" hint="You will still see it here in the Studio." checked={Boolean(layout.hidden)} onChange={(hidden) => set({ hidden: hidden || undefined })} />
            </div>
          ) : null}
        </div>
      </div>
    </FieldShell>
  );
}
