"use client";

// The block library as the Studio uses it: the same blocks the site renders,
// with each field's plain description swapped for a real control, and the
// page framed by the shared header and footer.
import type { Config } from "@puckeditor/core";
import type { ReactNode } from "react";
import { blocks, categories, root } from "@/blocks/config";
import { StudioCanvasRoot } from "./chrome";
import { artboard } from "./fields/ArtboardField";
import { fieldRenderers } from "./fields";
import type { FieldProps, FieldRenderer } from "./fields/types";

const renderers: Record<string, FieldRenderer> = { ...fieldRenderers, artboard };

type AnyField = { type: string; metadata?: { kind?: string }; arrayFields?: Record<string, AnyField>; objectFields?: Record<string, AnyField>; render?: unknown };

function resolveField(field: AnyField): AnyField {
  if (field?.type === "custom" && field.metadata?.kind) {
    const Control = renderers[field.metadata.kind];
    return { ...field, render: (props: FieldProps) => (Control ? <Control {...props} /> : <></>) };
  }
  if (field?.type === "array") return { ...field, arrayFields: mapFields(field.arrayFields) };
  if (field?.type === "object") return { ...field, objectFields: mapFields(field.objectFields) };
  return field;
}

function mapFields(fields: Record<string, AnyField> | undefined) {
  return Object.fromEntries(Object.entries(fields ?? {}).map(([k, f]) => [k, resolveField(f)]));
}

export function buildStudioConfig(): Config {
  const components = Object.fromEntries(
    Object.entries(blocks as unknown as Record<string, { fields?: Record<string, AnyField> }>).map(([name, b]) => [name, { ...b, fields: mapFields(b.fields) }]),
  );
  const rootFields = mapFields(root.fields as unknown as Record<string, AnyField>);
  return {
    components,
    categories: Object.fromEntries(Object.entries(categories).map(([k, c]) => [k, { title: c.title, components: c.components }])),
    root: {
      ...root,
      fields: rootFields,
      resolveFields: (data: { props?: { kind?: string } }, { fields }: { fields: Record<string, unknown> }) => {
        if (data.props?.kind === "collection") return fields;
        const { collection: _c, ...rest } = fields;
        return rest;
      },
      render: ({ children }: { children: ReactNode }) => <StudioCanvasRoot>{children}</StudioCanvasRoot>,
    },
  } as unknown as Config;
}
