"use client";

// The settings controls, by the `metadata.kind` blocks give their custom
// fields in src/blocks/fields.ts. The Studio looks a kind up here and renders
// the control in place of the field's placeholder render.
import { ChoiceField, HiddenField, NoteField, ToggleField } from "./basic";
import { LayoutField } from "./LayoutField";
import { CollectionField, ColourwayField, DesignField, StudyField } from "./LibraryFields";
import { LinkField } from "./LinkField";
import { PhotoField } from "./PhotoField";
import { ShadeField } from "./ShadeField";
import type { FieldRenderer } from "./types";
import { VideoField } from "./VideoField";

export const fieldRenderers: Record<string, FieldRenderer> = {
  choice: ChoiceField,
  toggle: ToggleField,
  photo: PhotoField,
  link: LinkField,
  shade: ShadeField,
  layout: LayoutField,
  collection: CollectionField,
  colourway: ColourwayField,
  design: DesignField,
  study: StudyField,
  video: VideoField,
  note: NoteField,
  hidden: HiddenField,
};

export { PhotoPicker } from "./PhotoPicker";
export type { FieldProps, FieldRenderer } from "./types";
