import type { ReactElement } from "react";

/**
 * What every settings control receives. Blocks describe their fields in
 * src/blocks/fields.ts as plain data ({ type: "custom", metadata: { kind } });
 * the Studio swaps in the control registered for that kind.
 */
export type FieldProps<V = unknown, Opts = Record<string, unknown>> = {
  field: { label?: string; metadata?: { kind: string } & Opts };
  name: string;
  id: string;
  value: V;
  onChange: (value: V) => void;
  readOnly?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each control narrows its own value type
export type FieldRenderer = (props: FieldProps<any, any>) => ReactElement | null;
