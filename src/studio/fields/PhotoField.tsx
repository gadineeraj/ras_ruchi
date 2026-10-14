"use client";

// The photo well: drop a photo in or choose one from Photos, set the point
// that must stay in view when it is cropped, and describe it.
/* eslint-disable @next/next/no-img-element -- Studio thumbnails are plain images of local files. */
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";
import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { Photo } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import { useStudio } from "../state";
import { Button, Spinner, Switch, ui } from "../ui";
import { clean, FieldShell, isImageFile, toPhoto, useFileDrop, type PhotoValue } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

type Point = { x: number; y: number };

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));

export function PhotoField({ field, id, value, onChange, readOnly }: FieldProps<PhotoValue | null | undefined, { hint?: string }>) {
  const { pickPhoto, upload, toast } = useStudio();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [savedAlt, setSavedAlt] = useState("");
  const photo = value?.src ? value : null;
  const labelId = `${id}-label`;

  /** Puts a new photo in the well, keeping the description and focal point she set. */
  const place = (next: Photo) => {
    if (!photo) return onChange(clean({ ...next }));
    onChange(
      clean({
        ...next,
        alt: photo.decorative ? "" : photo.alt || next.alt || "",
        focus: photo.focus,
        decorative: photo.decorative || undefined,
      }),
    );
  };

  const choose = async () => {
    const picked = await pickPhoto({ title: photo ? "Replace the photo" : "Choose a photo", current: photo });
    if (picked) place(picked);
  };

  const addFiles = async (files: File[]) => {
    const image = files.find(isImageFile);
    if (!image) {
      toast("That file isn't a photo. Use a JPG, PNG, WebP or GIF.", { tone: "error" });
      return;
    }
    setBusy(true);
    setFailed(null);
    try {
      const [item] = await upload([image]);
      if (item) place(toPhoto(item));
      else setFailed("That photo couldn't be added. Try another file.");
    } catch (e) {
      const message = (e as Error).message || "That photo couldn't be added.";
      toast(message, { tone: "error" });
      setFailed(message);
    } finally {
      setBusy(false);
    }
  };

  const drop = useFileDrop((files) => void addFiles(files), !readOnly && !busy);

  if (!photo) {
    return (
      <FieldShell label={field.label} labelId={labelId} hint={field.metadata?.hint} error={failed} readOnly={readOnly}>
        <div className={css.drop} data-over={drop.over || undefined} {...drop.props}>
          {busy ? (
            <>
              <Spinner />
              <p>Adding the photo…</p>
            </>
          ) : (
            <>
              <ImageIcon size={22} aria-hidden="true" />
              <p>{drop.over ? "Let go to add it" : "Drop a photo here or"}</p>
              {drop.over ? null : (
                <Button size="s" onClick={choose} aria-describedby={labelId}>
                  Choose from Photos
                </Button>
              )}
            </>
          )}
        </div>
      </FieldShell>
    );
  }

  const decorative = Boolean(photo.decorative);
  const alt = photo.alt ?? "";

  return (
    <FieldShell label={field.label} labelId={labelId} readOnly={readOnly}>
      {field.metadata?.hint ? <p className={ui.hint}>{field.metadata.hint}</p> : null}
      <div className={css.stage} data-over={drop.over || undefined} {...drop.props}>
        <FocusPicker photo={photo} hintId={`${id}-focus`} onFocus={(focus) => onChange({ ...photo, focus })} />
        {drop.over || busy ? (
          <div className={css.stageCover} aria-live="polite">
            {busy ? <Spinner /> : null}
            <span>{busy ? "Adding the photo…" : "Let go to replace it"}</span>
          </div>
        ) : null}
      </div>
      <p className={ui.hint} id={`${id}-focus`}>
        Click the most important part; it stays in view when the photo is cropped.
      </p>
      {failed ? (
        <p className={ui.error} role="alert">
          {failed}
        </p>
      ) : null}
      <div className={css.actions}>
        <Button size="s" icon={<ArrowsClockwiseIcon size={15} aria-hidden="true" />} onClick={choose} disabled={busy}>
          Replace
        </Button>
        <Button size="s" variant="ghost" icon={<TrashIcon size={15} aria-hidden="true" />} onClick={() => onChange(null)} disabled={busy}>
          Remove
        </Button>
      </div>

      <div className={css.altBlock}>
        <label className={ui.label} htmlFor={`${id}-alt`}>
          Describe the photo
        </label>
        <input
          id={`${id}-alt`}
          className={ui.input}
          value={decorative ? "" : alt}
          disabled={decorative}
          placeholder={decorative ? "Not needed for a decorative photo" : "What it shows, e.g. Kinari blind in brick red"}
          onChange={(e) => onChange({ ...photo, alt: e.currentTarget.value })}
        />
        <Switch
          label="Decorative only"
          hint="For textures and ornaments that carry no meaning."
          checked={decorative}
          onChange={(on) => {
            if (on) {
              setSavedAlt(alt);
              onChange({ ...photo, alt: "", decorative: true });
            } else {
              onChange(clean({ ...photo, alt: savedAlt, decorative: undefined }));
            }
          }}
        />
        {!decorative && !alt.trim() ? (
          <p className={css.warn}>
            <WarningIcon size={15} aria-hidden="true" />
            Add a few words so people who can&rsquo;t see the photo know what it shows.
          </p>
        ) : null}
      </div>
    </FieldShell>
  );
}

/** The thumbnail at its real shape; clicking or dragging on it sets the focal point. */
function FocusPicker({ photo, hintId, onFocus }: { photo: PhotoValue; hintId: string; onFocus: (p: Point) => void }) {
  const [drag, setDrag] = useState<Point | null>(null);
  const shown = drag ?? photo.focus ?? { x: 50, y: 50 };
  const ratio = photo.width && photo.height ? photo.width / photo.height : 4 / 3;

  const at = (e: PointerEvent<HTMLElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  const nudge = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const move: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } };
    const d = move[e.key];
    if (!d) return;
    e.preventDefault();
    const from = photo.focus ?? { x: 50, y: 50 };
    onFocus({ x: clamp(from.x + d.x), y: clamp(from.y + d.y) });
  };

  return (
    <button
      type="button"
      className={css.frame}
      data-dragging={drag ? "" : undefined}
      style={{ "--ratio": ratio, backgroundColor: photo.color, backgroundImage: photo.blur ? `url("${photo.blur}")` : undefined } as CSSProperties}
      aria-label={`Focal point, ${shown.x}% across and ${shown.y}% down. Use the arrow keys to move it.`}
      aria-describedby={hintId}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(at(e));
      }}
      onPointerMove={(e) => {
        if (drag) setDrag(at(e));
      }}
      onPointerUp={(e) => {
        if (!drag) return;
        const p = at(e);
        setDrag(null);
        onFocus(p);
      }}
      onPointerCancel={() => setDrag(null)}
      onKeyDown={nudge}
    >
      <img src={asset(photo.src)} alt="" draggable={false} />
      <span className={css.ring} data-unset={photo.focus || drag ? undefined : ""} style={{ left: `${shown.x}%`, top: `${shown.y}%` }} aria-hidden="true" />
    </button>
  );
}
