"use client";

// Site: the settings every page shares. Her name and contact details, the
// shop, the menu, the footer, the colour palette, the share image and a word
// about the fonts. Changes save as she types, like everything else.
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { useId, useRef, useState } from "react";
import type { NavLink, Shade, SiteSettings } from "@/lib/content-types";
import { asset, normalisePath } from "@/lib/paths";
import { useStudio } from "../state";
import { Button, Field, IconButton, PanelHead, Section, Select, TextArea, TextInput, ui } from "../ui";
import { errorText } from "./shared";
import p from "./panels.module.css";

const CONTACT = "#contact";
const OTHER = "__other";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX = /^#[0-9a-f]{6}$/;

/** "#ABC", "abc", "#aabbcc" → "#aabbcc"; anything else → null. */
function toHex(raw: string): string | null {
  let v = raw.trim().toLowerCase();
  if (!v.startsWith("#")) v = `#${v}`;
  if (/^#[0-9a-f]{3}$/.test(v)) v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return HEX.test(v) ? v : null;
}

function webAddressError(href: string): string | null {
  const v = href.trim();
  if (!v) return "Add a web address.";
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(v)) return null;
  return "Start with https:// for another website, or / for one of your pages.";
}

export function SitePanel() {
  const { content, setSite } = useStudio();
  const site = content.site;
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setSite((s) => ({ ...s, [key]: value }));
  const year = new Date().getFullYear();

  return (
    <div className={p.panel}>
      <PanelHead title="Site" />
      <div className={p.body}>
        <p className={p.lead}>Settings shared by every page. Changes save as you type.</p>

        <Section title="Name and contact">
          <TextInput label="Site name" value={site.name} onChange={(v) => set("name", v)} placeholder="ras.ruchi" />
          <TextInput label="Name in Devanagari" value={site.nameDevanagari} onChange={(v) => set("nameDevanagari", v)} placeholder="रसरुचि" />
          <TextInput label="Your name" value={site.person} onChange={(v) => set("person", v)} placeholder="Shruchi Jaiswal" />
          <TextInput label="What you do" value={site.role} onChange={(v) => set("role", v)} placeholder="Textile designer" />
          <TextInput
            label="Email"
            type="email"
            value={site.email}
            onChange={(v) => set("email", v.trim())}
            placeholder="name@example.com"
            error={site.email && !EMAIL.test(site.email) ? "Check the email address. It should look like name@example.com." : null}
            hint="Where the Contact link sends visitors."
          />
          <TextArea label="Site description" value={site.description} onChange={(v) => set("description", v)} rows={4} hint="Used by Google and when the site is shared. One or two sentences about your work." />
        </Section>

        <Section title="Shop">
          <TextInput label="Shop name" value={site.shop.name} onChange={(v) => setSite((s) => ({ ...s, shop: { ...s.shop, name: v } }))} placeholder="The Yellow Dwelling" />
          <TextInput
            label="Shop web address"
            type="url"
            value={site.shop.url}
            onChange={(v) => setSite((s) => ({ ...s, shop: { ...s.shop, url: v.trim() } }))}
            placeholder="https://"
            error={site.shop.url && !/^https?:\/\//i.test(site.shop.url) ? "Start with https://" : null}
            hint={`Swatch links read "Brick Red at ${site.shop.name || "The Yellow Dwelling"}" and open this shop.`}
          />
        </Section>

        <Section title="Menu">
          <p className={p.hint}>The links across the top of every page. Contact jumps to your contact details at the bottom.</p>
          <LinkList noun="menu link" items={site.nav} onChange={(nav) => set("nav", nav)} withPages />
        </Section>

        <Section title="Footer">
          <TextInput label="Heading" value={site.footer.heading} onChange={(v) => setSite((s) => ({ ...s, footer: { ...s.footer, heading: v } }))} placeholder="Write to Shruchi" />
          <Field label="Links">
            <LinkList noun="footer link" items={site.links} onChange={(links) => set("links", links)} />
          </Field>
          <TextArea label="Credit line" value={site.footer.credit} onChange={(v) => setSite((s) => ({ ...s, footer: { ...s.footer, credit: v } }))} rows={3} />
          <TextInput
            label="Copyright line"
            value={site.footer.copyright}
            onChange={(v) => setSite((s) => ({ ...s, footer: { ...s.footer, copyright: v } }))}
            hint={`Write {year} and it shows the current year, ${year}.`}
          />
        </Section>

        <Section title="Colours">
          <p className={p.hint}>These are the colours offered for bands, cards and backgrounds.</p>
          <Palette />
        </Section>

        <Section title="Sharing">
          <ShareImage />
        </Section>

        <Section title="Fonts">
          <dl className={p.fonts}>
            <div>
              <dt>Titles</dt>
              <dd>Rozha One</dd>
            </div>
            <div>
              <dt>Taglines</dt>
              <dd>Bodoni Moda italic</dd>
            </div>
            <div>
              <dt>Reading</dt>
              <dd>Jost</dd>
            </div>
          </dl>
          <p className={p.hint}>The fonts are part of the design, so they stay the same on every page. That keeps the whole site looking like one shade card.</p>
        </Section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- link lists

function LinkList({ items, onChange, withPages = false, noun }: { items: NavLink[]; onChange: (next: NavLink[]) => void; withPages?: boolean; noun: string }) {
  const { pageList, toast } = useStudio();
  const pages = pageList.filter((r) => r.id !== "not-found");
  const pagePaths = new Set(pages.map((r) => r.path));

  const list = useRef<HTMLOListElement>(null);
  const update = (i: number, patch: Partial<NavLink>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    // Keep the keyboard on the link that moved.
    requestAnimationFrame(() => {
      const card = list.current?.children[j];
      const same = card?.querySelector<HTMLButtonElement>(`[data-move="${dir < 0 ? "up" : "down"}"]`);
      (same && !same.disabled ? same : card?.querySelector<HTMLButtonElement>("[data-move]:not(:disabled)"))?.focus();
    });
  };
  const remove = (i: number) => {
    const before = items;
    onChange(items.filter((_, j) => j !== i));
    toast(`Removed "${items[i].label || `this ${noun}`}".`, { action: { label: "Undo", run: () => onChange(before) } });
  };
  const add = () => {
    const fresh: NavLink = withPages ? { label: "New link", href: "/" } : { label: "New link", href: "https://" };
    // New menu links go before Contact, which stays last.
    const contactAt = items.findIndex((it) => it.href === CONTACT);
    onChange(contactAt >= 0 && withPages ? [...items.slice(0, contactAt), fresh, ...items.slice(contactAt)] : [...items, fresh]);
  };

  return (
    <>
      {items.length ? (
        <ol ref={list} className={p.items}>
          {items.map((it, i) => (
            <li key={i} className={p.item}>
              <div className={p.itemTools}>
                <span className={p.itemIndex}>Link {i + 1}</span>
                <span>
                  <IconButton size="s" label={`Move "${it.label}" up`} icon={<ArrowUpIcon size={16} />} disabled={i === 0} data-move="up" onClick={() => move(i, -1)} />
                  <IconButton size="s" label={`Move "${it.label}" down`} icon={<ArrowDownIcon size={16} />} disabled={i === items.length - 1} data-move="down" onClick={() => move(i, 1)} />
                  <IconButton size="s" label={`Remove "${it.label}"`} icon={<TrashIcon size={16} />} onClick={() => remove(i)} />
                </span>
              </div>
              <TextInput label="Words" value={it.label} onChange={(v) => update(i, { label: v })} />
              {withPages ? (
                <LinkTarget href={it.href} pages={pages} pagePaths={pagePaths} onChange={(href) => update(i, { href })} />
              ) : (
                <TextInput label="Web address" type="url" value={it.href} onChange={(v) => update(i, { href: v.trim() })} placeholder="https://" error={webAddressError(it.href)} />
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className={p.hint}>No links yet.</p>
      )}
      <div>
        <Button size="s" icon={<PlusIcon size={14} weight="bold" />} onClick={add}>
          Add a {noun}
        </Button>
      </div>
    </>
  );
}

/** Where a menu link goes: one of her pages, the contact details, or any other address. */
function LinkTarget({ href, pages, pagePaths, onChange }: { href: string; pages: { id: string; title: string; path: string; draft?: boolean }[]; pagePaths: Set<string>; onChange: (href: string) => void }) {
  const [typing, setTyping] = useState(false);
  const asPath = href.startsWith("/") ? normalisePath(href) : href;
  const choice = href === CONTACT ? CONTACT : !typing && pagePaths.has(asPath) ? asPath : OTHER;

  return (
    <>
      <Select
        label="Goes to"
        value={choice}
        onChange={(v) => {
          if (v === OTHER) {
            setTyping(true);
            if (href === CONTACT) onChange("https://");
            return;
          }
          setTyping(false);
          onChange(v);
        }}
        options={[...pages.map((r) => ({ label: r.draft ? `${r.title} (draft)` : r.title || r.path, value: r.path })), { label: "Contact details", value: CONTACT }, { label: "Another web address", value: OTHER }]}
      />
      {choice === OTHER ? <TextInput label="Web address" type="url" value={href} onChange={(v) => onChange(v.trim())} placeholder="https://" error={webAddressError(href)} /> : null}
    </>
  );
}

// ------------------------------------------------------------------- palette

function Palette() {
  const { content, setSite, toast, confirm } = useStudio();
  const shades = content.site.shades;

  const update = (id: string, patch: Partial<Shade>) => setSite((s) => ({ ...s, shades: s.shades.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  const add = () => {
    const taken = new Set(shades.map((x) => x.id));
    let id = "new-colour";
    for (let n = 2; taken.has(id); n++) id = `new-colour-${n}`;
    setSite((s) => ({ ...s, shades: [...s.shades, { id, name: "New colour", hex: "#8c6a4a" }] }));
  };

  const remove = async (shade: Shade) => {
    // Look everywhere except the palette itself.
    const elsewhere = JSON.stringify({ ...content, site: { ...content.site, shades: [] } }).toLowerCase();
    const used = elsewhere.includes(shade.hex.toLowerCase());
    if (used) {
      const ok = await confirm({
        title: `Remove ${shade.name || "this colour"}?`,
        body: "This colour is used on your site. Those places keep it, but it won't be offered as a choice any more.",
        confirm: "Remove colour",
        danger: true,
      });
      if (!ok) return;
    }
    const before = content.site.shades;
    setSite((s) => ({ ...s, shades: s.shades.filter((x) => x.id !== shade.id) }));
    toast(`Removed ${shade.name || "the colour"} from the palette.`, { action: { label: "Undo", run: () => setSite((s) => ({ ...s, shades: before })) } });
  };

  return (
    <>
      {shades.length ? (
        <ol className={p.items}>
          {shades.map((shade) => (
            <li key={shade.id}>
              <ShadeRow shade={shade} onChange={(patch) => update(shade.id, patch)} onRemove={() => void remove(shade)} />
            </li>
          ))}
        </ol>
      ) : (
        <p className={p.hint}>No colours yet. Add the shades you use most.</p>
      )}
      <div>
        <Button size="s" icon={<PlusIcon size={14} weight="bold" />} onClick={add}>
          Add a colour
        </Button>
      </div>
    </>
  );
}

function ShadeRow({ shade, onChange, onRemove }: { shade: Shade; onChange: (patch: Partial<Shade>) => void; onRemove: () => void }) {
  const nameId = useId();
  const hexId = useId();
  // While she types a code, show her words; otherwise show the saved colour.
  const [draft, setDraft] = useState<string | null>(null);
  const hex = toHex(shade.hex) ?? "#000000";
  const text = draft ?? shade.hex;
  const bad = draft !== null && toHex(draft) === null;
  const label = shade.name || "this colour";

  return (
    <div className={p.shade}>
      <label className={p.colorWell} style={{ backgroundColor: hex }}>
        <span className={p.srOnly}>Pick a colour for {label}</span>
        <input type="color" value={hex} onChange={(e) => onChange({ hex: e.currentTarget.value.toLowerCase() })} />
      </label>
      <div className={p.shadeName}>
        <label className={p.srOnly} htmlFor={nameId}>
          Colour name
        </label>
        <input
          id={nameId}
          className={ui.input}
          value={shade.name}
          placeholder="Colour name"
          onChange={(e) => onChange({ name: e.currentTarget.value })}
          onBlur={() => {
            if (!shade.name.trim()) onChange({ name: "Unnamed colour" });
          }}
        />
      </div>
      <div className={p.shadeHex}>
        <label className={p.srOnly} htmlFor={hexId}>
          Colour code for {label}
        </label>
        <input
          id={hexId}
          className={ui.input}
          value={text}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={bad || undefined}
          aria-describedby={bad ? `${hexId}-error` : undefined}
          onFocus={() => setDraft(shade.hex)}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setDraft(v);
            const ok = toHex(v);
            if (ok && v.trim().replace(/^#?/, "#").length === 7) onChange({ hex: ok });
          }}
          onBlur={() => {
            const ok = draft === null ? null : toHex(draft);
            if (ok) {
              if (ok !== shade.hex) onChange({ hex: ok });
              setDraft(null);
            } else if (draft !== null && !draft.trim()) setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setDraft(null);
          }}
        />
        {bad ? (
          <p id={`${hexId}-error`} className={p.miniError}>
            Use a code like #6a2222
          </p>
        ) : null}
      </div>
      <span className={p.shadeTools}>
        <IconButton size="s" label={`Remove ${label}`} icon={<TrashIcon size={16} />} onClick={onRemove} />
      </span>
    </div>
  );
}

// --------------------------------------------------------------- share image

function ShareImage() {
  const { content, setSite, pickPhoto, toast } = useStudio();
  const photo = content.site.shareImage ?? null;

  const choose = async () => {
    try {
      const picked = await pickPhoto({ title: "Share image", current: photo });
      if (picked) setSite((s) => ({ ...s, shareImage: picked }));
    } catch (e) {
      toast(errorText(e), { tone: "error" });
    }
  };

  const remove = () => {
    setSite((s) => ({ ...s, shareImage: null }));
    toast("Removed the share image.", { action: { label: "Undo", run: () => setSite((s) => ({ ...s, shareImage: photo })) } });
  };

  return (
    <>
      {photo?.src ? (
        <div className={p.thumb} style={{ backgroundColor: photo.color }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(photo.src)} alt={photo.alt || "The share image"} style={{ objectPosition: photo.focus ? `${photo.focus.x}% ${photo.focus.y}%` : undefined }} />
        </div>
      ) : (
        <div className={p.thumbEmpty}>
          <ImageSquareIcon size={22} aria-hidden="true" />
          <span>No share image yet</span>
        </div>
      )}
      <p className={p.hint}>Shown when a page is shared on WhatsApp or Instagram.</p>
      <div className={p.actions}>
        <Button size="s" variant={photo ? "secondary" : "primary"} onClick={() => void choose()}>
          {photo ? "Change photo" : "Choose a photo"}
        </Button>
        {photo ? (
          <Button size="s" variant="ghost" onClick={remove}>
            Remove
          </Button>
        ) : null}
      </div>
    </>
  );
}
