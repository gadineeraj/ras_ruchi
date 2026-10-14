// Field descriptions for the Studio's settings panel. Blocks describe their
// fields here with plain data; the Studio supplies the controls (photo picker,
// colour picker, link picker…) by `metadata.kind`, so the published site never
// loads any editor code.
import type { Field } from "@puckeditor/core";

type Opt = { label: string; value: string | number | boolean };

const unresolved = () => null as unknown as React.ReactElement;

function custom(kind: string, label: string, extra: Record<string, unknown> = {}): Field {
  return { type: "custom", label, render: unresolved, metadata: { kind, ...extra } } as Field;
}

export const f = {
  text: (label: string, opts: { inline?: boolean; placeholder?: string } = {}): Field => ({
    type: "text",
    label,
    placeholder: opts.placeholder,
    contentEditable: opts.inline ?? false,
  }),
  textarea: (label: string, opts: { inline?: boolean; placeholder?: string } = {}): Field => ({
    type: "textarea",
    label,
    placeholder: opts.placeholder,
    contentEditable: opts.inline ?? false,
  }),
  rich: (label: string, opts: { inline?: boolean } = {}): Field => ({
    type: "richtext",
    label,
    contentEditable: opts.inline ?? true,
    options: { heading: { levels: [2, 3] }, codeBlock: false, code: false, strike: false, horizontalRule: false } as never,
  }),
  number: (label: string, min?: number, max?: number): Field => ({ type: "number", label, min, max }),
  select: (label: string, options: Opt[]): Field => ({ type: "select", label, options }),
  /** Small sets of choices, shown as a row of buttons. */
  choice: (label: string, options: Opt[]): Field => custom("choice", label, { options }),
  toggle: (label: string, hint?: string): Field => custom("toggle", label, { hint }),
  photo: (label: string, hint?: string): Field => custom("photo", label, { hint }),
  link: (label: string): Field => custom("link", label),
  shade: (label: string, opts: { allowNone?: boolean } = {}): Field => custom("shade", label, opts),
  layout: (opts: { widths?: string[]; spaces?: string[] } = {}): Field => custom("layout", "Layout", opts),
  collection: (label: string, opts: { allowPage?: boolean } = {}): Field => custom("collection", label, opts),
  colourway: (label: string): Field => custom("colourway", label),
  design: (label: string): Field => custom("design", label),
  study: (label: string): Field => custom("study", label),
  artboard: (label: string): Field => custom("artboard", label),
  video: (label: string): Field => custom("video", label),
  note: (text: string): Field => custom("note", "", { text }),
  array: (label: string, arrayFields: Record<string, Field>, opts: { summary?: (item: any, i?: number) => string; add?: Record<string, unknown>; min?: number; max?: number } = {}): Field =>
    ({
      type: "array",
      label,
      arrayFields,
      getItemSummary: opts.summary,
      defaultItemProps: opts.add,
      min: opts.min,
      max: opts.max,
    }) as Field,
  object: (label: string, objectFields: Record<string, Field>): Field => ({ type: "object", label, objectFields }) as Field,
  slot: (allow?: string[], disallow?: string[]): Field => ({ type: "slot", allow, disallow }),
};

export const opts = {
  heading: [
    { label: "Hero", value: "hero" },
    { label: "Large", value: "display" },
    { label: "Medium", value: "title" },
    { label: "Small", value: "small" },
  ],
  align: [
    { label: "Left", value: "start" },
    { label: "Centre", value: "center" },
  ],
  align3: [
    { label: "Left", value: "start" },
    { label: "Centre", value: "center" },
    { label: "Right", value: "end" },
  ],
  ratio: [
    { label: "Original", value: "auto" },
    { label: "Square", value: "1:1" },
    { label: "Portrait 4:5", value: "4:5" },
    { label: "Tall 2:3", value: "2:3" },
    { label: "Landscape 3:2", value: "3:2" },
    { label: "Wide 16:9", value: "16:9" },
    { label: "Banner 21:9", value: "21:9" },
  ],
};
