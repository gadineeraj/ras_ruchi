import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { kern } from "@/components/kern";
import type { Photo, SiteMeta } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import styles from "./blocks.module.css";

// ------------------------------------------------------------------ layout

export type Width = "full" | "wide" | "text" | "narrow";
export type Space = "none" | "xs" | "s" | "m" | "l" | "xl";
export type Show = "all" | "desktop" | "mobile";
export type Motion = "none" | "rise" | "fade";

/** The layout choices every block shares. */
export type LayoutProps = {
  width?: Width;
  space?: Space;
  show?: Show;
  motion?: Motion;
  anchor?: string;
  /** Kept on the page in the Studio but left out of the published site. */
  hidden?: boolean;
};

/** Wraps a block in its width, spacing, visibility and entrance. */
export function Frame({ layout, children, as: Tag = "div", className, style, label }: { layout: LayoutProps; children: ReactNode; as?: "div" | "section" | "figure" | "aside"; className?: string; style?: CSSProperties; label?: string }) {
  const { width = "wide", space = "m", show = "all", motion = "none", anchor, hidden } = layout ?? {};
  return (
    <Tag
      id={anchor || undefined}
      className={`${styles.frame} ${className ?? ""}`}
      data-width={width}
      data-space={space}
      data-show={show}
      data-motion={motion}
      data-hidden={hidden || undefined}
      style={style}
      aria-label={label}
    >
      {children}
    </Tag>
  );
}

// -------------------------------------------------------------------- text

/** Text props arrive as strings on the site and as editable nodes in the Studio. */
export type TextValue = string | ReactNode;

export function display(value: TextValue): ReactNode {
  return typeof value === "string" ? kern(value) : value;
}

export function plain(value: TextValue, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** True when a text prop holds something to show. */
export function filled(value: TextValue | undefined | null): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.replace(/<[^>]*>/g, "").trim().length > 0;
  return true;
}

/** Swaps {collections}, {designs}, {colourways} and {studies} for live counts. */
export function counts(value: TextValue, meta?: SiteMeta): TextValue {
  if (typeof value !== "string" || !meta || !value.includes("{")) return value;
  const designs = meta.collections.reduce((n, c) => n + c.designs.length, 0);
  const colourways = meta.collections.reduce((n, c) => n + c.designs.reduce((m, d) => m + d.colourways.length, 0), 0);
  return value
    .replaceAll("{collections}", String(meta.collections.length))
    .replaceAll("{designs}", String(designs))
    .replaceAll("{colourways}", String(colourways))
    .replaceAll("{studies}", String(meta.studies.length));
}

// ------------------------------------------------------------------- links

export type LinkValue = { href: string; newTab?: boolean };

const EXTERNAL = /^(https?:|mailto:|tel:)/;

/** Internal paths get the trailing slash the static site is built with. */
export function toHref(href: string): string {
  if (!href || EXTERNAL.test(href) || href.startsWith("#")) return href;
  const [path, hash] = href.split("#");
  const withSlash = path === "" || path.endsWith("/") ? path : `${path}/`;
  return hash ? `${withSlash}#${hash}` : withSlash;
}

export function SmartLink({ href, newTab, className, children, ariaLabel }: { href: string; newTab?: boolean; className?: string; children: ReactNode; ariaLabel?: string }) {
  if (!href) return <span className={className}>{children}</span>;
  if (EXTERNAL.test(href) || newTab) {
    const blank = newTab || /^https?:/.test(href);
    return (
      <a href={href} className={className} target={blank ? "_blank" : undefined} rel={blank ? "noopener" : undefined} aria-label={ariaLabel}>
        {children}
        {blank ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={toHref(href)} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

// ------------------------------------------------------------------ photos

export type Ratio = "auto" | "1:1" | "4:5" | "3:4" | "3:2" | "4:3" | "16:9" | "21:9" | "2:3";

export function ratioCss(ratio: Ratio | undefined, photo?: Photo | null): string | undefined {
  if (!ratio || ratio === "auto") return photo ? `${photo.width} / ${photo.height}` : "4 / 3";
  const [w, h] = ratio.split(":");
  return `${w} / ${h}`;
}

/** A photograph filling its frame, cropped around its focal point. */
export function Pic({ photo, sizes, alt, preload, className, style }: { photo: Photo | null | undefined; sizes: string; alt?: string; preload?: boolean; className?: string; style?: CSSProperties }) {
  if (!photo?.src) return <span className={`${styles.picEmpty} ${className ?? ""}`} style={style} aria-hidden="true" />;
  const focus = photo.focus ? `${photo.focus.x}% ${photo.focus.y}%` : undefined;
  return (
    <Image
      src={asset(photo.src)}
      alt={alt ?? photo.alt ?? ""}
      fill
      sizes={sizes}
      quality={82}
      placeholder={photo.blur ? "blur" : "empty"}
      blurDataURL={photo.blur || undefined}
      preload={preload}
      unoptimized={photo.animated}
      className={className}
      style={{ objectFit: "cover", objectPosition: focus, ...style }}
    />
  );
}

/** A photograph at its own proportions, as wide as its column. */
export function NaturalPic({ photo, sizes, alt, className }: { photo: Photo; sizes: string; alt?: string; className?: string }) {
  return (
    <Image
      src={asset(photo.src)}
      alt={alt ?? photo.alt ?? ""}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      quality={82}
      placeholder={photo.blur ? "blur" : "empty"}
      blurDataURL={photo.blur || undefined}
      unoptimized={photo.animated}
      className={className}
      style={{ backgroundColor: photo.color, width: "100%", height: "auto" }}
    />
  );
}

// ---------------------------------------------------------------- colours

/** Off-white or near-black text, whichever reads better on a band colour. */
export function onShade(hex: string): "light" | "dark" {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex?.trim() ?? "");
  if (!m) return "light";
  const n = parseInt(m[1], 16);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  const light = 0.95 / (L + 0.05); // contrast with #f7f3ee (luminance ~0.9)
  const dark = (L + 0.05) / 0.06; // contrast with #1b1a14 (luminance ~0.01)
  return dark > light ? "dark" : "light";
}
