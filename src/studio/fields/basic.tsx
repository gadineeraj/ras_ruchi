"use client";

// The simplest controls: a row of choices, an on/off switch, a note, and the
// fields the Studio keeps but never shows.
import { Chips, Segmented, Switch, ui } from "../ui";
import { FieldShell } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

type Opt = { label: string; value: string | number | boolean };
type Val = string | number | boolean;

/** Up to four short choices sit in one segmented bar; more wrap as chips. */
function fitsOneBar(options: Opt[]): boolean {
  if (options.length > 4) return false;
  const lengths = options.map((o) => String(o.label).length);
  return lengths.every((n) => n <= 12) && lengths.reduce((a, b) => a + b, 0) <= 30;
}

export function ChoiceField({ field, id, value, onChange, readOnly }: FieldProps<Val | null | undefined, { options?: Opt[] }>) {
  const options = field.metadata?.options ?? [];
  // Values can be numbers; compare loosely so "3" and 3 both select "3".
  const selected = options.find((o) => String(o.value) === String(value)) ?? options[0];
  const labelId = `${id}-label`;
  const props = { value: selected?.value ?? "", options, onChange: (v: Val) => onChange(v), label: field.label };
  return (
    <FieldShell label={field.label} labelId={labelId} readOnly={readOnly}>
      {fitsOneBar(options) ? <Segmented<Val> {...props} /> : <Chips<Val> {...props} />}
    </FieldShell>
  );
}

export function ToggleField({ field, value, onChange, readOnly }: FieldProps<boolean | null | undefined, { hint?: string }>) {
  return (
    <fieldset className={css.shell} disabled={readOnly || undefined}>
      <Switch label={field.label ?? ""} hint={field.metadata?.hint} checked={Boolean(value)} onChange={(v) => onChange(v)} />
    </fieldset>
  );
}

export function NoteField({ field }: FieldProps<unknown, { text?: string }>) {
  const text = field.metadata?.text;
  return text ? <p className={`${ui.hint} ${css.note}`}>{text}</p> : null;
}

export function HiddenField(): null {
  return null;
}
