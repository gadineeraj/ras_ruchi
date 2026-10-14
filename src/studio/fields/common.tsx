"use client";

// Pieces every settings control shares: the labelled frame, file dropping,
// photo conversion and the pinked cloth chip.
/* eslint-disable @next/next/no-img-element -- Studio thumbnails are plain lazy images of local files. */
import { useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import type { Img, MediaItem, Photo } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import { ui } from "../ui";
import css from "./fields.module.css";

/** A photo as a field stores it: alt text may be left out on purpose. */
export type PhotoValue = Photo & { decorative?: boolean };

/**
 * The frame around one control: its label (with an optional action at the
 * right), the control, then a hint or an error. A fieldset, so a read-only
 * field disables every button and input inside it at once.
 */
export function FieldShell({
  label,
  labelId,
  htmlFor,
  hint,
  error,
  action,
  readOnly,
  children,
}: {
  label?: ReactNode;
  labelId?: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  action?: ReactNode;
  readOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className={css.shell} disabled={readOnly || undefined} aria-labelledby={label && !htmlFor ? labelId : undefined}>
      {label || action ? (
        <div className={css.head}>
          {label ? (
            htmlFor ? (
              <label className={ui.label} htmlFor={htmlFor} id={labelId}>
                {label}
              </label>
            ) : (
              <span className={ui.label} id={labelId}>
                {label}
              </span>
            )
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className={ui.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={ui.hint}>{hint}</p>
      ) : null}
    </fieldset>
  );
}

const carriesFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/** Drag-and-drop of files from her computer onto an element. */
export function useFileDrop(onFiles: (files: File[]) => void, enabled = true) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const props = {
    onDragEnter: (e: DragEvent) => {
      if (!enabled || !carriesFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setOver(true);
    },
    onDragOver: (e: DragEvent) => {
      if (!enabled || !carriesFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: DragEvent) => {
      if (!enabled || !carriesFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      if (!enabled || !carriesFiles(e)) return;
      e.preventDefault();
      e.stopPropagation();
      depth.current = 0;
      setOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
  };
  return { over, props };
}

/** A library item as a photo placed on a page. */
export function toPhoto(item: MediaItem): Photo {
  const photo: Photo = { src: item.src, width: item.width, height: item.height, blur: item.blur, color: item.color, alt: item.alt ?? "" };
  if (item.animated) photo.animated = true;
  return photo;
}

/** Drops keys left undefined, so stored JSON stays tidy. */
export function clean<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export const isImageFile = (f: File) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|avif|heic)$/i.test(f.name);
export const isVideoFile = (f: File) => f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.name);

/** "kinari--brick-red--scene-de474d9d" → "kinari brick red scene". */
export function readableName(name: string): string {
  return name
    .replace(/-[0-9a-f]{8}$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/** True when every word of the search appears somewhere in the text. */
export function matches(query: string, text: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = text.toLowerCase().replace(/[-_/]+/g, " ");
  return words.every((w) => hay.includes(w));
}

/** A square of cloth cut with pinking shears, as on the site's shade cards. */
export function PinkedChip({ img, size, className }: { img: Img | null | undefined; size?: number; className?: string }) {
  const style: CSSProperties = {
    backgroundColor: img?.color ?? "var(--s-sunk)",
    backgroundImage: img?.blur ? `url("${img.blur}")` : undefined,
    width: size,
    height: size,
  };
  return (
    <span className={`${css.pinked} ${className ?? ""}`} style={style} aria-hidden="true">
      {img?.src ? <img src={asset(img.src)} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </span>
  );
}
