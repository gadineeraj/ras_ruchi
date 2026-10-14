"use client";

import Image from "next/image";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Photo } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import styles from "../blocks.module.css";

export type GalleryItem = { photo: Photo; caption?: string };

type Props = {
  items: GalleryItem[];
  layout: "auto" | "grid" | "masonry" | "strip" | "feature";
  columns: number;
  ratio?: string;
  captions: boolean;
  lightbox: boolean;
  mobile: "one" | "two";
  title: string;
  disabled?: boolean;
};

function sizesFor(columns: number) {
  return `(max-width: 560px) 94vw, (max-width: 900px) 46vw, ${Math.round(96 / columns)}vw`;
}

// A set of photographs. Pressing one opens it full screen; arrow keys move
// through the set and Escape closes it, as a native dialog does.
export function GalleryGrid({ items, layout, columns, ratio, captions, lightbox, mobile, title, disabled }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(0);
  const cols = layout === "auto" ? (items.length === 1 ? 1 : items.length === 2 || items.length === 4 ? 2 : 3) : columns;
  const shape = layout === "masonry" || ratio === "auto" || !ratio ? undefined : ratio.replace(":", " / ");

  const show = (i: number) => {
    if (disabled || !lightbox) return;
    setOpen(i);
    dialog.current?.showModal();
  };
  const step = (by: number) => setOpen((i) => (i + by + items.length) % items.length);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  const alt = (item: GalleryItem, i: number) => item.photo.alt || item.caption || (items.length > 1 ? `${title}, ${i + 1} of ${items.length}` : title);
  const current = items[open];

  return (
    <>
      <div className={styles.gallery} data-layout={layout === "auto" ? "grid" : layout} data-mobile={mobile} style={{ "--cols": cols } as CSSProperties}>
        {items.map((item, i) => {
          const img = shape ? (
            <span className={styles.plate} style={{ aspectRatio: shape, display: "block", backgroundColor: item.photo.color }}>
              <Image src={asset(item.photo.src)} alt={alt(item, i)} fill sizes={sizesFor(cols)} quality={82} placeholder={item.photo.blur ? "blur" : "empty"} blurDataURL={item.photo.blur || undefined} unoptimized={item.photo.animated} style={{ objectFit: "cover", objectPosition: item.photo.focus ? `${item.photo.focus.x}% ${item.photo.focus.y}%` : undefined }} />
            </span>
          ) : (
            <Image src={asset(item.photo.src)} alt={alt(item, i)} width={item.photo.width} height={item.photo.height} sizes={sizesFor(cols)} quality={82} placeholder={item.photo.blur ? "blur" : "empty"} blurDataURL={item.photo.blur || undefined} unoptimized={item.photo.animated} style={{ width: "100%", height: "auto", backgroundColor: item.photo.color }} />
          );
          return (
            <figure key={`${item.photo.src}-${i}`} className={styles.galleryItem}>
              {lightbox ? (
                <button type="button" className={styles.galleryButton} onClick={() => show(i)} aria-label={`Open ${alt(item, i)} full screen`}>
                  {img}
                </button>
              ) : (
                img
              )}
              {captions && item.caption ? <figcaption className={styles.caption}>{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>

      {lightbox ? (
        <dialog ref={dialog} className={styles.lightbox} onKeyDown={onKey} aria-label={title}>
          <div className={styles.lightboxInner}>
            <div className={styles.lightboxBar}>
              <span className="t-label">
                {open + 1} of {items.length}
              </span>
              <button type="button" onClick={() => dialog.current?.close()}>
                <XIcon size={16} weight="bold" aria-hidden="true" /> Close
              </button>
            </div>
            <div className={styles.lightboxStage}>
              {current ? <Image key={current.photo.src} src={asset(current.photo.src)} alt={alt(current, open)} fill sizes="100vw" quality={88} unoptimized={current.photo.animated} /> : null}
            </div>
            <div className={styles.lightboxNav}>
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo">
                <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
              </button>
              <p>{current?.caption ?? ""}</p>
              <button type="button" onClick={() => step(1)} aria-label="Next photo">
                <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
