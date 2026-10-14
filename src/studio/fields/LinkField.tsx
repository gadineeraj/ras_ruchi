"use client";

// Where a link goes: one of her pages (and a section on it), a web address,
// an email address or a phone number.
import { useState, type ReactNode } from "react";
import type { LinkValue } from "@/blocks/shared";
import { normalisePath } from "@/lib/paths";
import { useStudio } from "../state";
import { Segmented, Switch, ui } from "../ui";
import { clean, FieldShell } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

type Mode = "none" | "page" | "web" | "email" | "phone";

const MODES: { label: string; value: Mode }[] = [
  { label: "A page", value: "page" },
  { label: "Web address", value: "web" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
];

function modeOf(href: string): Mode {
  const h = href.trim();
  if (!h) return "none";
  if (/^mailto:/i.test(h)) return "email";
  if (/^tel:/i.test(h)) return "phone";
  if (h.startsWith("/") || h.startsWith("#")) return "page";
  return "web";
}

/** "/practice#contact" → ["/practice", "contact"]; "#contact" → ["#", "contact"]. */
function splitHref(href: string): [string, string] {
  const at = href.indexOf("#");
  if (at < 0) return [href, ""];
  return [href.slice(0, at) || "#", href.slice(at + 1)];
}

function joinHref(path: string, anchor: string): string {
  if (!anchor) return path;
  return path === "#" || !path ? `#${anchor}` : `${path}#${anchor}`;
}

const slugAnchor = (v: string) =>
  v
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");

/** Every anchor name set on a page's blocks, for suggestions. */
function anchorsIn(node: unknown, out: Set<string>): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => anchorsIn(n, out));
  else if (node && typeof node === "object") {
    const o = node as { props?: { layout?: { anchor?: string } } };
    const anchor = o.props?.layout?.anchor;
    if (anchor) out.add(anchor);
    Object.values(node).forEach((v) => {
      if (v && typeof v === "object") anchorsIn(v, out);
    });
  }
  return out;
}

const looksLikeWeb = (href: string) => {
  try {
    return new URL(href).hostname.includes(".");
  } catch {
    return false;
  }
};

export function LinkField({ field, id, value, onChange, readOnly }: FieldProps<LinkValue | string | null | undefined>) {
  const { pageList, content, currentId } = useStudio();
  const link: LinkValue = typeof value === "string" ? { href: value } : { href: value?.href ?? "", newTab: value?.newTab };
  // A mode she picked before typing anything; once there is an address, it decides.
  const [picked, setPicked] = useState<Mode>("none");
  const [touched, setTouched] = useState(false);
  const mode = link.href ? modeOf(link.href) : picked;
  const labelId = `${id}-label`;

  const set = (patch: Partial<LinkValue>) => {
    const next = clean({ ...link, ...patch, newTab: (patch.newTab ?? link.newTab) || undefined });
    // Leaving a field unchanged shouldn't add an undo step.
    if (next.href !== link.href || Boolean(next.newTab) !== Boolean(link.newTab)) onChange(next);
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setPicked(m);
    setTouched(false);
    set({ href: "", newTab: m === "web" ? undefined : link.newTab });
  };

  const [path, anchor] = mode === "page" ? splitHref(link.href) : ["", ""];
  const target = path === "#" ? currentId : pageList.find((p) => p.path === normalisePath(path))?.id;
  const suggestions = mode === "page" ? [...anchorsIn(target ? content.pages[target] : null, new Set(["contact"]))].sort() : [];

  const known = !path || path === "#" || pageList.some((p) => p.path === normalisePath(path));

  let control: ReactNode = null;
  let error: string | null = null;

  if (mode === "page") {
    control = (
      <>
        <select id={`${id}-page`} className={ui.select} value={known ? (path === "#" || !path ? path : normalisePath(path)) : path} aria-label="Page" onChange={(e) => set({ href: joinHref(e.currentTarget.value, anchor) })}>
          {!path ? (
            <option value="" disabled>
              Choose a page
            </option>
          ) : null}
          {!known ? <option value={path}>{path} (no page has this address)</option> : null}
          <option value="#">This page</option>
          {pageList.map((p) => (
            <option key={p.id} value={p.path}>
              {p.title} · {p.path}
              {p.draft ? " (draft)" : ""}
            </option>
          ))}
        </select>
        <div className={css.sub}>
          <label className={ui.label} htmlFor={`${id}-anchor`}>
            Jump to a section <span className={css.optional}>(optional)</span>
          </label>
          <input
            id={`${id}-anchor`}
            className={ui.input}
            list={`${id}-anchors`}
            value={anchor}
            placeholder="e.g. contact"
            disabled={!path}
            onChange={(e) => set({ href: joinHref(path || "#", slugAnchor(e.currentTarget.value)) })}
            onBlur={() => set({ href: joinHref(path, anchor.replace(/^-+|-+$/g, "")) })}
          />
          <datalist id={`${id}-anchors`}>
            {suggestions.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <p className={ui.hint}>The anchor name set in a block&rsquo;s Layout settings.</p>
        </div>
        {!known ? <p className={css.warn}>No page has this address any more. Choose one from the list.</p> : null}
      </>
    );
  } else if (mode === "web") {
    if (touched && link.href && !looksLikeWeb(link.href)) error = "This doesn't look like a web address yet.";
    control = (
      <input
        id={`${id}-web`}
        className={ui.input}
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        value={link.href}
        placeholder="https://www.instagram.com/…"
        onChange={(e) => set({ href: e.currentTarget.value.trim() })}
        onBlur={() => {
          setTouched(true);
          const h = link.href.trim();
          if (h && !/^[a-z][a-z0-9+.-]*:/i.test(h) && !h.startsWith("/") && !h.startsWith("#")) set({ href: `https://${h.replace(/^\/+/, "")}` });
        }}
      />
    );
  } else if (mode === "email") {
    const shown = link.href.replace(/^mailto:/i, "");
    if (touched && shown && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shown)) error = "Check the email address; it needs an @ and a domain.";
    control = (
      <input
        id={`${id}-email`}
        className={ui.input}
        type="email"
        autoComplete="off"
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        value={shown}
        placeholder="name@example.com"
        onChange={(e) => {
          const v = e.currentTarget.value.trim();
          set({ href: v ? `mailto:${v}` : "" });
        }}
        onBlur={() => setTouched(true)}
      />
    );
  } else if (mode === "phone") {
    const shown = link.href.replace(/^tel:/i, "");
    control = (
      <input
        id={`${id}-phone`}
        className={ui.input}
        type="tel"
        autoComplete="off"
        aria-labelledby={labelId}
        value={shown}
        placeholder="+91 98765 43210"
        onChange={(e) => {
          const v = e.currentTarget.value;
          set({ href: v.trim() ? `tel:${v}` : "" });
        }}
        onBlur={() => {
          const digits = shown.replace(/[^\d+]/g, "");
          set({ href: digits ? `tel:${digits}` : "" });
        }}
      />
    );
  }

  return (
    <FieldShell
      label={field.label}
      labelId={labelId}
      readOnly={readOnly}
      error={error}
      hint={mode === "none" ? "No link yet. Choose where it should go." : mode === "phone" ? "Phones offer to call this number." : undefined}
      action={
        mode !== "none" ? (
          <button
            type="button"
            className={css.textButton}
            onClick={() => {
              setPicked("none");
              setTouched(false);
              onChange({ href: "" });
            }}
          >
            Remove link
          </button>
        ) : null
      }
    >
      <div className={css.modes}>
        <Segmented<Mode> value={mode} options={MODES} onChange={switchMode} label={`${field.label ?? "Link"}: what it opens`} />
      </div>
      {control}
      {mode === "page" ? <Switch label="Open in a new tab" checked={Boolean(link.newTab)} onChange={(on) => set({ newTab: on })} /> : null}
      {mode === "web" ? (
        <fieldset className={`${css.shell} ${css.dim}`} disabled>
          <Switch label="Open in a new tab" hint="Other websites always open in a new tab." checked onChange={() => {}} />
        </fieldset>
      ) : null}
    </FieldShell>
  );
}
