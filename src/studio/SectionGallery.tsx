"use client";

// "+ Add section": the section designs as a shade card. Each design is a real,
// scaled-down render of its blocks (filled with her own photographs for the
// preview), mounted on a sheet of card stock with a punched hole, glued a
// little crooked to the board. Handling a sheet lifts it, as cloth lifts off a
// shade card; choosing one deals it onto the page.
import { Render, useGetPuck } from "@puckeditor/core";
import { useMemo, useState, type CSSProperties } from "react";
import { config as siteConfig } from "@/blocks/config";
import type { MediaItem, Photo } from "@/lib/content-types";
import { insertTree } from "./puck-utils";
import { presetGroups, presets, type Preset } from "./presets";
import { useStudio } from "./state";
import { Dialog } from "./ui";
import st from "./studio.module.css";

const PLATE_WIDTH = 210;
// Designs made of words preview narrower, so their type stays legible.
const previewWidth = (p: Preset) => (p.group === "Words" || p.group === "Highlights" ? 820 : 1200);

type Node = Record<string, unknown>;

/** Puts her photographs into a preview's empty photo slots (the inserted section stays empty). */
function withSamplePhotos<T>(tree: T, photos: Photo[]): T {
  let n = 0;
  const visit = (v: unknown, key?: string): unknown => {
    if (Array.isArray(v)) return v.map((x) => visit(x));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Node).map(([k, x]) => [k, visit(x, k)]));
    if (v === null && (key === "photo" || key === "cover") && photos.length) return photos[n++ % photos.length];
    return v;
  };
  const filled = visit(tree) as Node;
  // Galleries and photo strips start empty; show them with a few photographs.
  const fill = (node: Node): Node => {
    if (!node || typeof node !== "object") return node;
    const props = { ...(node.props as Node) };
    if (node.type === "Gallery" && !(props.items as unknown[])?.length) props.items = photos.slice(0, 6).map((photo) => ({ photo, caption: "" }));
    for (const [k, v] of Object.entries(props)) if (Array.isArray(v) && v.some((x) => x && typeof x === "object" && "type" in x)) props[k] = v.map((x) => fill(x as Node));
    return { ...node, props: { ...props, id: `preview-${node.type}-${n++}` } };
  };
  return fill(filled) as T;
}

function Sheet({ preset, index, photos, onChoose }: { preset: Preset; index: number; photos: Photo[]; onChoose: () => void }) {
  const { meta } = useStudio();
  const data = useMemo(
    () => ({ root: { props: {} }, content: [withSamplePhotos(preset.tree, photos.slice(index % Math.max(photos.length, 1)).concat(photos))] }),
    [preset, photos, index],
  );
  const tilt = (((index * 37) % 7) - 3) * 0.35;
  return (
    <div className={st.sheet} style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
      <span className={st.sheetHole} aria-hidden="true" />
      <div className={st.sheetPlate} aria-hidden="true" inert>
        <div className={st.sheetRender} style={{ width: previewWidth(preset), zoom: PLATE_WIDTH / previewWidth(preset) }}>
          <Render config={siteConfig} data={data as never} metadata={{ ...meta, editing: true, preview: true } as never} />
        </div>
      </div>
      <button type="button" className={st.sheetChoose} onClick={onChoose}>
        <strong>{preset.title}</strong>
        <small>{preset.description}</small>
      </button>
    </div>
  );
}

export function SectionGallery() {
  const { gallery, closeGallery, content } = useStudio();
  const getPuck = useGetPuck();
  const [group, setGroup] = useState<string>("All");
  const list = presets.filter((p) => group === "All" || p.group === group);

  // Her own photographs, a varied handful, to show each design as it could look.
  const photos = useMemo(() => {
    const pool = content.media.filter((m: MediaItem) => m.kind !== "video" && m.width >= 900 && !/--chip/.test(m.src));
    const step = Math.max(1, Math.floor(pool.length / 12));
    return pool.filter((_, i) => i % step === 0).slice(0, 12).map(({ name: _n, folder: _f, added: _a, kind: _k, ...img }) => img as Photo);
  }, [content.media]);

  const choose = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (!preset || !gallery) return;
    closeGallery();
    insertTree(getPuck() as never, preset.tree as never, gallery);
  };

  return (
    <Dialog open={Boolean(gallery)} onClose={closeGallery} title="Add a section" size="l">
      <div className={st.galleryGrid}>
        <nav className={st.galleryNav} aria-label="Kinds of section">
          {["All", ...presetGroups].map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g}
            </button>
          ))}
          <p className={st.galleryNote}>Previews use your photos to show how each design looks. It arrives with empty places for your own.</p>
        </nav>
        <div className={st.sheets}>
          {list.map((p, i) => (
            <Sheet key={p.id} preset={p} index={i} photos={photos} onChoose={() => choose(p.id)} />
          ))}
        </div>
      </div>
    </Dialog>
  );
}
