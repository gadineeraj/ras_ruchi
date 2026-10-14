"use client";

// The photo picker: every photo in her library, searchable and sorted into
// folders, with new ones added by dropping them in. Opens whenever any part
// of the Studio calls pickPhoto(); render it once inside <StudioProvider>.
/* eslint-disable @next/next/no-img-element -- A grid of local library thumbnails; plain lazy images keep it light. */
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr/UploadSimple";
import { VideoCameraIcon } from "@phosphor-icons/react/dist/ssr/VideoCamera";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaItem } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import { useStudio, type PhotoRequest } from "../state";
import { Button, Chips, Dialog, Empty, Spinner, ui } from "../ui";
import { isImageFile, isVideoFile, matches, readableName, toPhoto, useFileDrop } from "./common";
import css from "./fields.module.css";

const PAGE = 120;

export function PhotoPicker() {
  const { photoRequest } = useStudio();
  // Mounted only while a request is open, so every opening starts fresh.
  return photoRequest ? <PickerDialog request={photoRequest} /> : null;
}

type FolderOption = { label: string; value: string };

/** "Studies/Sura" and "Studies/Kapaas" sit together under "Studies"; plain folders stay loose. */
function shelve(folders: string[]): { loose: FolderOption[]; groups: { head: string; items: FolderOption[] }[] } {
  const loose: FolderOption[] = [];
  const byHead = new Map<string, FolderOption[]>();
  for (const f of folders) {
    const at = f.indexOf("/");
    if (at < 0) {
      loose.push({ label: f, value: f });
      continue;
    }
    const head = f.slice(0, at);
    byHead.set(head, [...(byHead.get(head) ?? []), { label: f.slice(at + 1), value: f }]);
  }
  return { loose, groups: [...byHead].map(([head, items]) => ({ head, items })) };
}

/** Its description, else its file name; bare numbers like "01" get their folder: "Sura 01". */
function labelOf(m: MediaItem): string {
  const alt = m.alt?.trim();
  if (alt) return alt;
  const name = readableName(m.name);
  const shelf = m.folder?.split("/").pop() ?? "";
  if (!name) return shelf || "Untitled";
  return /^[\d\s]+$/.test(name) && shelf ? `${shelf} ${name}` : name;
}

function PickerDialog({ request }: { request: PhotoRequest }) {
  const { content, closePhotoPicker, upload, toast } = useStudio();
  const allowVideo = Boolean(request.allowVideo);
  const media = useMemo(() => content.media.filter((m) => allowVideo || m.kind !== "video"), [content.media, allowVideo]);
  const folders = useMemo(() => [...new Set(media.map((m) => m.folder).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [media]);

  const shelves = useMemo(() => shelve(folders), [folders]);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [selected, setSelected] = useState<string | null>(request.current?.src ?? null);
  const [limit, setLimit] = useState(() => {
    const at = media.findIndex((m) => m.src === request.current?.src);
    return at < PAGE ? PAGE : Math.ceil((at + 1) / PAGE) * PAGE;
  });
  const [busy, setBusy] = useState(false);

  const results = useMemo(() => media.filter((m) => (!folder || m.folder === folder) && matches(query, `${m.name} ${m.alt ?? ""} ${m.folder}`)), [media, folder, query]);
  const shown = results.slice(0, limit);
  const chosen = selected ? media.find((m) => m.src === selected) ?? null : null;

  const use = (item: MediaItem | null) => {
    if (item) closePhotoPicker(toPhoto(item));
  };

  const add = async (files: File[]) => {
    const usable = files.filter((f) => isImageFile(f) || (allowVideo && isVideoFile(f)));
    if (!usable.length) {
      toast(allowVideo ? "Those files aren't photos or videos." : "Those files aren't photos. Use JPG, PNG, WebP or GIF.", { tone: "error" });
      return;
    }
    setBusy(true);
    try {
      const items = await upload(usable, "Uploads");
      if (items[0]) {
        setQuery("");
        setFolder("");
        setSelected(items[0].src);
      }
    } catch (e) {
      toast((e as Error).message || "Those files couldn't be added.", { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const drop = useFileDrop((files) => void add(files), !busy);
  const fileInput = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  // The dialog opens before this runs, so the search box keeps the focus.
  useEffect(() => {
    search.current?.focus();
  }, []);

  // A file dropped beside the drop area would make the browser open it and
  // leave the Studio; while the picker is open, such drops do nothing.
  useEffect(() => {
    const guard = (e: globalThis.DragEvent) => {
      if (Array.from(e.dataTransfer?.types ?? []).includes("Files")) e.preventDefault();
    };
    window.addEventListener("dragover", guard);
    window.addEventListener("drop", guard);
    return () => {
      window.removeEventListener("dragover", guard);
      window.removeEventListener("drop", guard);
    };
  }, []);

  // Keep the chosen photo in view: on opening, and after an upload selects one.
  useEffect(() => {
    grid.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const title = request.title ?? (allowVideo ? "Choose a photo or video" : "Choose a photo");
  const noun = allowVideo ? "files" : "photos";

  return (
    <Dialog
      open
      size="l"
      title={title}
      onClose={() => closePhotoPicker(null)}
      footer={
        <>
          <p className={css.pickerStatus}>{chosen ? labelOf(chosen) : `${media.length} ${noun} in your library`}</p>
          <Button variant="ghost" onClick={() => closePhotoPicker(null)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!chosen} onClick={() => use(chosen)}>
            {allowVideo && chosen?.kind === "video" ? "Use this video" : "Use this photo"}
          </Button>
        </>
      }
    >
      <div className={css.picker} data-over={drop.over || undefined} {...drop.props}>
        <div className={css.pickerBar}>
          <div className={css.search}>
            <MagnifyingGlassIcon size={16} aria-hidden="true" />
            <input ref={search} className={ui.input} type="search" value={query} placeholder="Search by name, description or folder" aria-label={`Search ${noun}`} onChange={(e) => setQuery(e.currentTarget.value)} />
          </div>
          <Button icon={busy ? <Spinner /> : <UploadSimpleIcon size={16} aria-hidden="true" />} disabled={busy} onClick={() => fileInput.current?.click()}>
            {busy ? "Adding…" : "Upload new"}
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={allowVideo ? "image/*,video/*" : "image/*"}
            hidden
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
              if (files.length) void add(files);
            }}
          />
        </div>
        <p className={ui.hint}>Or drop {noun} from your computer anywhere here. New ones go in the Uploads folder.</p>

        {folders.length > 1 ? (
          <div className={css.folders} role="group" aria-label="Folder">
            <div className={css.folderRow}>
              <span className={css.folderHead}>Folder</span>
              <Chips<string> label="Folder" value={folder} onChange={setFolder} options={[{ label: "All", value: "" }, ...shelves.loose]} />
            </div>
            {shelves.groups.map((g) => (
              <div key={g.head} className={css.folderRow}>
                <span className={css.folderHead}>{g.head}</span>
                <Chips<string> label={g.head} value={folder} onChange={setFolder} options={g.items} />
              </div>
            ))}
          </div>
        ) : null}

        {media.length === 0 ? (
          <Empty
            title={`No ${noun} yet`}
            action={
              <Button variant="primary" icon={<UploadSimpleIcon size={16} aria-hidden="true" />} onClick={() => fileInput.current?.click()}>
                Upload from your computer
              </Button>
            }
          >
            Add {noun} here once and use them anywhere on the site.
          </Empty>
        ) : results.length === 0 ? (
          <Empty
            title="Nothing matches"
            action={
              <Button
                onClick={() => {
                  setQuery("");
                  setFolder("");
                }}
              >
                Show everything
              </Button>
            }
          >
            Try another word, or look in all folders.
          </Empty>
        ) : (
          <div ref={grid} className={css.grid} role="group" aria-label={title}>
            {shown.map((m) => {
              const on = m.src === selected;
              const label = labelOf(m);
              return (
                <button
                  key={m.src}
                  type="button"
                  className={css.tile}
                  aria-pressed={on}
                  data-selected={on || undefined}
                  title={`${label} (${m.folder})`}
                  onClick={(e) => {
                    // Enter or Space on the chosen tile confirms it.
                    if (on && e.detail === 0) use(m);
                    else setSelected(m.src);
                  }}
                  onDoubleClick={() => use(m)}
                >
                  <span className={css.tileImg} style={{ backgroundColor: m.color, backgroundImage: m.blur ? `url("${m.blur}")` : undefined }}>
                    {m.kind === "video" ? (
                      <>
                        <video src={asset(m.src)} muted playsInline preload="metadata" />
                        <VideoCameraIcon className={css.tileBadge} size={16} aria-hidden="true" />
                      </>
                    ) : (
                      <img src={asset(m.src)} alt="" loading="lazy" decoding="async" draggable={false} />
                    )}
                  </span>
                  <span className={css.tileName}>{label}</span>
                  {on ? (
                    <span className={css.tick} aria-hidden="true">
                      <CheckIcon size={14} weight="bold" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {results.length > limit ? (
          <div className={css.showMore}>
            <Button onClick={() => setLimit((n) => n + PAGE)}>Show more</Button>
            <span className={ui.hint}>
              {limit} of {results.length} shown
            </span>
          </div>
        ) : null}

        {drop.over ? (
          <div className={css.pickerCover} aria-hidden="true">
            <UploadSimpleIcon size={28} />
            <span>Let go to add them to Photos</span>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
