"use client";

// A video: a YouTube, Vimeo or Instagram link, or a clip she uploads.
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr/UploadSimple";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";
import { useRef, useState } from "react";
import { asset } from "@/lib/paths";
import { useStudio } from "../state";
import { Button, Spinner, ui } from "../ui";
import { FieldShell, isVideoFile, useFileDrop } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

type Kind = "YouTube" | "Vimeo" | "Instagram" | "Uploaded clip" | "Not recognised";

/** The same patterns the Video block uses to embed a link. */
function kindOf(url: string): Kind | null {
  const u = url.trim();
  if (!u) return null;
  if (/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.test(u)) return "YouTube";
  if (/vimeo\.com\/(?:video\/)?(\d+)/.test(u)) return "Vimeo";
  if (/instagram\.com\/(p|reel)\/([\w-]+)/.test(u)) return "Instagram";
  if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) return "Uploaded clip";
  return "Not recognised";
}

export function VideoField({ field, id, value, onChange, readOnly }: FieldProps<string | null | undefined>) {
  const { upload, toast } = useStudio();
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const url = typeof value === "string" ? value : "";
  const kind = kindOf(url);

  const add = async (files: File[]) => {
    const clip = files.find(isVideoFile);
    if (!clip) {
      toast("That file isn't a video. Use an MP4 or MOV clip.", { tone: "error" });
      return;
    }
    setBusy(true);
    try {
      const [item] = await upload([clip], "Videos");
      if (item) onChange(item.src);
    } catch (e) {
      toast((e as Error).message || "That clip couldn't be added.", { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const drop = useFileDrop((files) => void add(files), !readOnly && !busy);

  return (
    <FieldShell label={field.label} labelId={`${id}-label`} htmlFor={id} readOnly={readOnly}>
      <div className={css.videoDrop} data-over={drop.over || undefined} {...drop.props}>
        <input
          id={id}
          className={ui.input}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={url}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-describedby={`${id}-hint ${id}-kind`}
          aria-invalid={kind === "Not recognised" || undefined}
          onChange={(e) => onChange(e.currentTarget.value.trim())}
        />
      </div>
      <p className={ui.hint} id={`${id}-hint`}>
        Paste a YouTube, Vimeo or Instagram link
      </p>

      <p className={css.status} id={`${id}-kind`} data-tone={kind === "Not recognised" ? "warn" : kind ? "good" : undefined} aria-live="polite">
        {kind === "Not recognised" ? (
          <>
            <WarningIcon size={15} aria-hidden="true" />
            Not recognised. Check the link, or upload the clip instead.
          </>
        ) : kind ? (
          <>
            <CheckCircleIcon size={15} aria-hidden="true" />
            {kind === "Uploaded clip" ? "Uploaded clip" : `${kind} video`}
          </>
        ) : null}
      </p>

      {kind === "Uploaded clip" ? <video className={css.clip} src={asset(url)} muted controls playsInline preload="metadata" aria-label="The uploaded clip" /> : null}

      <div className={css.actions}>
        <Button size="s" icon={busy ? <Spinner /> : <UploadSimpleIcon size={15} aria-hidden="true" />} disabled={busy} onClick={() => file.current?.click()}>
          {busy ? "Adding the clip…" : "Upload a clip"}
        </Button>
        {url ? (
          <Button size="s" variant="ghost" onClick={() => onChange("")} disabled={busy}>
            Clear
          </Button>
        ) : null}
        <input
          ref={file}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files ?? []);
            e.currentTarget.value = "";
            if (files.length) void add(files);
          }}
        />
      </div>
    </FieldShell>
  );
}
