"use client";

// The Photos panel: her whole library of photos and videos. Add them with the
// button or by dropping files anywhere on the panel; search and filter by
// folder; open one to describe it, move it, see where it is used, replace it
// everywhere at once, or delete it.
/* eslint-disable @next/next/no-img-element -- Library thumbnails are plain lazy images of local files. */
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr/UploadSimple";
import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from "react";
import type { MediaItem } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import { api } from "../api";
import { useStudio } from "../state";
import { Button, Empty, Field, IconButton, PanelHead, Section, Spinner, ui } from "../ui";
import css from "./library.module.css";

const PAGE = 80;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

const isVideo = (m: MediaItem) => m.kind === "video" || VIDEO.test(m.src);

/** "kinari--brick-red--scene-de474d9d" → "kinari brick red scene". */
const readable = (name: string) =>
  (name || "")
    .replace(/-[0-9a-f]{8}$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

const labelOf = (m: MediaItem) => m.alt?.trim() || readable(m.name) || "Untitled";

function matches(query: string, m: MediaItem) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${m.name} ${m.alt ?? ""} ${m.folder}`.toLowerCase().replace(/[-_/]+/g, " ");
  return words.every((w) => hay.includes(w));
}

/** One entry per file, so a photo listed twice never shows twice. */
function uniqueBySrc(list: MediaItem[]) {
  const seen = new Set<string>();
  return list.filter((m) => {
    if (!m?.src || seen.has(m.src)) return false;
    seen.add(m.src);
    return true;
  });
}

const carriesFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function PhotosPanel() {
  const { content, upload, toast } = useStudio();
  const media = useMemo(() => uniqueBySrc(content.media ?? []), [content.media]);
  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of media) if (m.folder) counts.set(m.folder, (counts.get(m.folder) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [media]);

  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastOpened = useRef<string | null>(null);
  const grid = useRef<HTMLUListElement>(null);

  const results = useMemo(() => media.filter((m) => (!folder || m.folder === folder) && matches(query, m)), [media, folder, query]);
  const shown = results.slice(0, limit);
  const item = selected ? (media.find((m) => m.src === selected) ?? null) : null;

  // Back from a photo: put the focus on its thumbnail again.
  useEffect(() => {
    if (item || !lastOpened.current) return;
    const src = lastOpened.current;
    lastOpened.current = null;
    const el = grid.current?.querySelector<HTMLElement>(`[data-src="${CSS.escape(src)}"]`);
    el?.focus({ preventScroll: false });
  }, [item]);

  const add = async (files: File[]) => {
    const usable = files.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/") || /\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|mp4|mov|webm|m4v)$/i.test(f.name));
    if (!usable.length) {
      toast("Those files aren't photos or videos. Photos can be JPG, PNG, WebP or GIF; videos MP4 or MOV.", { tone: "error" });
      return;
    }
    setBusy(true);
    try {
      const items = await upload(usable, folder || undefined);
      if (items.length) {
        setQuery("");
        setLimit(PAGE);
      }
    } catch (e) {
      toast((e as Error).message || "Those files couldn't be added.", { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const dropProps = {
    onDragEnter: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setOver(true);
    },
    onDragOver: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length && !busy) void add(files);
    },
  };

  const reset = () => {
    setQuery("");
    setFolder("");
    setLimit(PAGE);
  };

  const drop = over ? (
    <div className={css.drop} aria-hidden="true">
      <UploadSimpleIcon size={26} />
      Drop to add to Photos
    </div>
  ) : null;

  if (item) {
    return (
      <div className={`${ui.root} ${css.panel}`} {...dropProps}>
        <PanelHead title={isVideo(item) ? "Video" : "Photo"} back={<IconButton label="Back to all photos" icon={<ArrowLeftIcon size={18} />} onClick={() => setSelected(null)} />} />
        <div className={css.scroll}>
          <PhotoDetail key={item.src} item={item} folders={folders} onBack={() => setSelected(null)} onReplaced={(src) => setSelected(src)} />
        </div>
        {drop}
      </div>
    );
  }

  const addButton = (
    <Button variant="primary" block icon={busy ? <Spinner /> : <UploadSimpleIcon size={16} aria-hidden="true" />} disabled={busy} onClick={() => fileInput.current?.click()}>
      {busy ? "Adding…" : "Add photos"}
    </Button>
  );

  return (
    <div className={`${ui.root} ${css.panel}`} {...dropProps}>
      <PanelHead title="Photos" />
      <div className={css.scroll}>
        <div className={css.body}>
          <div className={css.stack}>
            {addButton}
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,video/*"
              hidden
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? []);
                e.currentTarget.value = "";
                if (files.length) void add(files);
              }}
            />
            <p className={css.muted}>Or drop photos and videos anywhere on this panel. {folder ? `They go in ${folder}.` : "They go in Uploads."}</p>
          </div>

          {media.length ? (
            <div className={css.stack}>
              <div className={css.search}>
                <MagnifyingGlassIcon size={16} aria-hidden="true" />
                <input
                  className={ui.input}
                  type="search"
                  value={query}
                  placeholder="Search by name, description or folder"
                  aria-label="Search photos"
                  onChange={(e) => {
                    setQuery(e.currentTarget.value);
                    setLimit(PAGE);
                  }}
                />
              </div>
              {folders.length > 1 ? (
                <select
                  className={ui.select}
                  aria-label="Folder"
                  value={folder}
                  onChange={(e) => {
                    setFolder(e.currentTarget.value);
                    setLimit(PAGE);
                  }}
                >
                  <option value="">All folders ({media.length})</option>
                  {folders.map(([name, n]) => (
                    <option key={name} value={name}>
                      {name.replaceAll("/", " / ")} ({n})
                    </option>
                  ))}
                </select>
              ) : null}
              <p className={css.muted} aria-live="polite">
                {query || folder ? `${plural(results.length, "match", "matches")} of ${media.length}` : plural(media.length, "file")}
              </p>
            </div>
          ) : null}

          {media.length === 0 ? (
            <Empty title="No photos yet">Add photos here once, then use them anywhere on the site.</Empty>
          ) : results.length === 0 ? (
            <Empty title="No photos match" action={<Button onClick={reset}>Show all photos</Button>}>
              {query ? `Nothing matches “${query}”${folder ? ` in ${folder}` : ""}.` : "This folder is empty."}
            </Empty>
          ) : (
            <>
              <ul ref={grid} className={css.grid} aria-label="Photos">
                {shown.map((m) => {
                  const video = isVideo(m);
                  const label = labelOf(m);
                  const needsAlt = !m.alt?.trim() && !video;
                  return (
                    <li key={m.src}>
                      <button
                        type="button"
                        className={css.thumb}
                        data-src={m.src}
                        style={{ backgroundColor: m.color, backgroundImage: m.blur ? `url("${m.blur}")` : undefined }}
                        aria-label={`${label}${video ? ", video" : ""}${needsAlt ? ", needs a description" : ""}`}
                        title={`${label} (${m.folder})`}
                        onClick={() => {
                          lastOpened.current = m.src;
                          setSelected(m.src);
                        }}
                      >
                        {video ? <video src={asset(m.src)} muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" /> : <img src={asset(m.src)} alt="" loading="lazy" decoding="async" draggable={false} />}
                        {video ? (
                          <span className={css.play} aria-hidden="true">
                            <PlayIcon size={16} weight="fill" />
                          </span>
                        ) : null}
                        {needsAlt ? <span className={css.needsAlt} title="Needs a description (alt text)" aria-hidden="true" /> : null}
                        <span className={css.thumbName} aria-hidden="true">
                          {label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {results.length > shown.length ? (
                <Button onClick={() => setLimit((l) => l + PAGE)}>Show more ({results.length - shown.length} left)</Button>
              ) : null}
            </>
          )}
        </div>
      </div>
      {drop}
    </div>
  );
}

// ------------------------------------------------------------------ detail

type Usage = { file: string; title: string }[];

function PhotoDetail({ item, folders, onBack, onReplaced }: { item: MediaItem; folders: [string, number][]; onBack: () => void; onReplaced: (src: string) => void }) {
  const { setMedia, flush, reloadAll, openPage, toast, confirm } = useStudio();
  const video = isVideo(item);
  const noun = video ? "video" : "photo";
  const ids = useId();

  const [alt, setAlt] = useState(item.alt ?? "");
  const [folder, setFolder] = useState(item.folder ?? "");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [usageError, setUsageError] = useState("");
  const [busy, setBusy] = useState<"replace" | "delete" | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  // Where it is used, read from the saved files once pending edits are saved.
  useEffect(() => {
    let live = true;
    flush()
      .then(() => api.usage(item.src))
      .then((u) => {
        if (live) setUsage(u);
      })
      .catch((e: Error) => {
        if (live) setUsageError(e.message || "Couldn't check where it is used.");
      });
    return () => {
      live = false;
    };
  }, [item.src, flush]);

  const saveAlt = () => {
    const next = alt.trim();
    if (next === (item.alt ?? "").trim()) return;
    setMedia((list) => list.map((m) => (m.src === item.src ? { ...m, alt: next } : m)));
  };

  const cleanFolder = folder.trim().replace(/\s*\/\s*/g, "/").replace(/^\/+|\/+$/g, "");
  const folderChanged = Boolean(cleanFolder) && cleanFolder !== item.folder;
  const sameFolder = folders.find(([name]) => name === item.folder)?.[1] ?? 1;

  const moveThis = () => {
    if (!folderChanged) return;
    setMedia((list) => list.map((m) => (m.src === item.src ? { ...m, folder: cleanFolder } : m)));
    toast(`Moved to ${cleanFolder}.`);
  };

  const renameFolder = () => {
    if (!folderChanged) return;
    const from = item.folder;
    setMedia((list) => list.map((m) => (m.folder === from ? { ...m, folder: cleanFolder } : m)));
    toast(`Renamed the folder for ${plural(sameFolder, "file")}.`);
  };

  const replace = async (file: File) => {
    setBusy("replace");
    try {
      await flush();
      const { item: next, changed } = await api.replace(item.src, file);
      reloadAll(await api.content());
      // The new file keeps this one's description, folder and name, listed once.
      setMedia((list) => {
        const at = list.findIndex((m) => m.src === item.src || m.src === next.src);
        const merged: MediaItem = { ...item, src: next.src, width: next.width, height: next.height, blur: next.blur, color: next.color, kind: next.kind, added: next.added };
        if (next.animated) merged.animated = true;
        else delete merged.animated;
        const rest = list.filter((m) => m.src !== item.src && m.src !== next.src);
        rest.splice(at < 0 ? 0 : Math.min(at, rest.length), 0, merged);
        return rest;
      });
      const pages = changed.filter((n) => n.startsWith("pages/")).length;
      const inLibrary = changed.includes("collections");
      const where = pages ? `Replaced on ${plural(pages, "page")}${inLibrary ? " and in the collections" : ""}.` : inLibrary ? "Replaced in the collections." : "Replaced. It wasn't used on any page yet.";
      toast(where, { tone: "success" });
      onReplaced(next.src);
    } catch (e) {
      toast((e as Error).message || `The ${noun} couldn't be replaced.`, { tone: "error" });
      setBusy(null);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete this ${noun}?`,
      body: `It is removed from Photos for good. A ${noun} still used on a page can't be deleted.`,
      confirm: `Delete ${noun}`,
      danger: true,
    });
    if (!ok) return;
    setBusy("delete");
    try {
      await flush();
      await api.removeMedia(item.src);
      reloadAll(await api.content());
      toast(video ? "Video deleted." : "Photo deleted.", { tone: "success" });
      onBack();
    } catch (e) {
      toast((e as Error).message || `The ${noun} couldn't be deleted.`, { tone: "error" });
      setBusy(null);
    }
  };

  const used = usage ?? [];
  const pagesUsing = used.filter((u) => u.file.startsWith("pages/"));
  const inUse = used.length > 0;

  return (
    <div className={css.body}>
      <div className={css.preview} style={{ backgroundColor: item.color }}>
        {video ? <video src={asset(item.src)} controls muted playsInline preload="metadata" /> : <img src={asset(item.src)} alt={item.alt ?? ""} style={{ backgroundImage: item.blur ? `url("${item.blur}")` : undefined, backgroundSize: "cover" }} />}
      </div>

      <div className={css.facts}>
        <strong>{readable(item.name) || "Untitled"}</strong>
        {!video && item.width && item.height ? <span className={css.muted}>{`${item.width} × ${item.height} pixels`}</span> : null}
        <span className={css.muted}>In {item.folder || "no folder"}</span>
      </div>

      {!video ? (
        <Field label="Describe the photo (alt text)" htmlFor={`${ids}-alt`} hint={alt.trim() ? "Used when you place this photo from now on. Pages that already show it keep their own description." : undefined}>
          <textarea id={`${ids}-alt`} className={ui.textarea} rows={3} value={alt} placeholder="e.g. Brick red linen blind with a gold zari border" onChange={(e) => setAlt(e.currentTarget.value)} onBlur={saveAlt} />
          {!alt.trim() ? <p className={css.warn}>No description yet. Say what the photo shows, for people who can&apos;t see it.</p> : null}
        </Field>
      ) : null}

      <Field label="Folder" htmlFor={`${ids}-folder`} hint="Type a new name to move it. Use a slash for a folder inside another, e.g. Collections/Rasaa.">
        <input
          id={`${ids}-folder`}
          className={ui.input}
          list={`${ids}-folders`}
          value={folder}
          onChange={(e) => setFolder(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") moveThis();
          }}
        />
        <datalist id={`${ids}-folders`}>
          {folders.map(([name]) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </Field>
      {folderChanged ? (
        <div className={css.rowWrap}>
          <Button size="s" variant="primary" onClick={moveThis}>
            Move this {noun}
          </Button>
          {sameFolder > 1 ? (
            <Button size="s" onClick={renameFolder}>
              Rename the folder ({plural(sameFolder, "file")})
            </Button>
          ) : null}
        </div>
      ) : null}

      <Section title="Used on">
        {usage === null && !usageError ? (
          <div className={css.row}>
            <Spinner />
            <span className={css.muted}>Checking the pages…</span>
          </div>
        ) : usageError ? (
          <p className={ui.error}>{usageError}</p>
        ) : !inUse ? (
          <p className={css.muted}>Not used on any page yet.</p>
        ) : (
          <ul className={css.list}>
            {used.map((u) => (
              <li key={u.file}>
                {u.file.startsWith("pages/") ? (
                  <button type="button" className={css.linkButton} onClick={() => openPage(u.file.replace("pages/", ""))}>
                    <span>{u.title}</span>
                    <ArrowSquareOutIcon size={15} aria-hidden="true" />
                    <span className={css.visuallyHidden}>Open this page</span>
                  </button>
                ) : (
                  <span className={css.plainItem}>{u.title}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Replace or delete">
        <p className={css.muted}>
          {pagesUsing.length ? `Replace swaps in a new file on ${plural(pagesUsing.length, "page")} at once, keeping each description and crop.` : "Replace swaps in a new file everywhere this one is used."}
        </p>
        <Button icon={busy === "replace" ? <Spinner /> : <ArrowsClockwiseIcon size={16} aria-hidden="true" />} disabled={busy !== null} onClick={() => replaceInput.current?.click()}>
          {busy === "replace" ? "Replacing…" : "Replace everywhere"}
        </Button>
        <input
          ref={replaceInput}
          type="file"
          accept={video ? "video/*" : "image/*"}
          hidden
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (file) void replace(file);
          }}
        />
        <Button variant="danger" icon={busy === "delete" ? <Spinner /> : <TrashIcon size={16} aria-hidden="true" />} disabled={busy !== null} onClick={() => void remove()}>
          {busy === "delete" ? "Deleting…" : `Delete ${noun}`}
        </Button>
        {inUse ? <p className={css.muted}>It can only be deleted once no page uses it.</p> : null}
      </Section>
    </div>
  );
}

export default PhotosPanel;
