"use client";

// Small helpers the side panels share: opening a page once it has arrived in
// the Studio's state, friendly dates, error wording and web-address checks.
import { useCallback, useEffect, useRef, useState } from "react";
import type { PageData } from "@/lib/content-types";
import { normalisePath } from "@/lib/paths";
import { useStudio } from "../state";

/**
 * Opens a page as soon as the Studio's state holds it. createPage, duplicatePage
 * and reloadAll update state on the next render, so opening straight away would
 * miss the new page.
 */
export function useOpenWhenReady() {
  const { content, openPage } = useStudio();
  const want = useRef<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = want.current;
    if (id && content.pages[id]) {
      want.current = null;
      openPage(id);
    }
  }, [tick, content.pages, openPage]);
  return useCallback((id: string) => {
    want.current = id;
    setTick((t) => t + 1);
  }, []);
}

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const dayTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const dayYearTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** "Today, 10:42", "Yesterday, 18:05", "14 Oct, 10:42", "3 Mar 2025, 09:10". */
export function friendlyDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return `Today, ${time.format(d)}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time.format(d)}`;
  return (d.getFullYear() === now.getFullYear() ? dayTime : dayYearTime).format(d);
}

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const dayYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** For the middle of a sentence: "today at 10:42", "yesterday at 18:05", "on 14 Oct at 10:42". */
export function whenText(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "earlier";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return `today at ${time.format(d)}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `yesterday at ${time.format(d)}`;
  return `on ${(d.getFullYear() === now.getFullYear() ? day : dayYear).format(d)} at ${time.format(d)}`;
}

/** "14 Oct, 10:42" style, always with the date. */
export function plainDate(d: Date): string {
  return dayTime.format(d);
}

export function errorText(e: unknown): string {
  return e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.";
}

/** Addresses the Studio and the site's own files already use. */
const RESERVED = ["/studio", "/api", "/images", "/_next"];

/**
 * Checks a web address typed for a page. Returns what to fix in plain words,
 * or null when it is fine.
 */
export function checkPath(raw: string, selfId: string | null, pages: Record<string, PageData>): string | null {
  const v = raw.trim();
  if (!v) return "Give the page a web address, like /about.";
  if (!v.startsWith("/")) return "Start the address with /, like /about.";
  if (v === "/") return "Only the home page lives at /. Add a word after it, like /about.";
  if (/[A-Z]/.test(v)) return "Use small letters only.";
  if (/\s/.test(v)) return "Use hyphens instead of spaces, like /my-page.";
  if (v.endsWith("/") || v.includes("//")) return "Remove the extra / at the end.";
  if (!/^(\/[a-z0-9-]+)+$/.test(v)) return "Use only letters, numbers and hyphens, with / between parts.";
  if (RESERVED.some((r) => v === r || v.startsWith(`${r}/`))) return "The Studio already uses this address. Choose another.";
  const other = Object.entries(pages).find(([id, d]) => id !== selfId && normalisePath(d.root.props.path) === v);
  if (other) return `"${other[1].root.props.title}" already uses this address.`;
  return null;
}

/** The address a new page would get: the one asked for, or with -2, -3… added. */
export function freePath(base: string, pages: Record<string, PageData>): string {
  const taken = new Set(Object.values(pages).map((p) => normalisePath(p.root.props.path)));
  const root = normalisePath(base);
  let p = root;
  for (let n = 2; taken.has(p); n++) p = `${root}-${n}`;
  return p;
}
