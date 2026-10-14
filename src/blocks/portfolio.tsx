import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { kern } from "@/components/kern";
import { NavLinks } from "@/components/NavLinks";
import { Swatch } from "@/components/Swatch";
import { SwatchCaption, SwatchChips, SwatchPicker, SwatchShopLink, SwatchWindow } from "@/components/SwatchPicker";
import { Wordmark } from "@/components/Wordmark";
import type { Collection, Photo, SiteMeta, StudySummary } from "@/lib/content-types";
import { collectionFor, collectionPath, colourwayCount, picksToSwatches, toSwatchItem } from "@/lib/library";
import { f } from "./fields";
import { counts, display, filled, Frame, NaturalPic, onShade, Pic, SmartLink, toHref, type LayoutProps, type LinkValue, type TextValue } from "./shared";
import type { PuckBits } from "./types";
import styles from "./blocks.module.css";
import hero from "@/components/home/HomeHero.module.css";
import stack from "@/components/CollectionStack.module.css";
import sheets from "@/components/StudyIndex.module.css";
import mosaic from "@/components/ShadeMosaic.module.css";
import process from "@/components/ProcessStrip.module.css";
import row from "@/components/DesignRow.module.css";
import practice from "./css/practice.module.css";
import coll from "./css/collection.module.css";
import study from "./css/study.module.css";
import index from "./css/index.module.css";

type L = { layout: LayoutProps };
const bandText = (hex: string) => (onShade(hex) === "dark" ? "dark" : "light");

// ---------------------------------------------------------------- HomeHero

type HeroProps = {
  label: TextValue;
  role: TextValue;
  intro: TextValue;
  ctaLabel: TextValue;
  cta: LinkValue;
  picks: { pick: string }[];
  showNav: boolean;
};

export const HomeHero = {
  label: "Home hero",
  description: "The first card of the book: her name across it, the menu on its printed rule, and swatches that open a window onto a room.",
  keywords: ["hero", "intro", "welcome", "banner", "header", "home"],
  fields: {
    label: f.text("Printed line", { inline: true }),
    role: f.text("Role line", { inline: true }),
    intro: f.textarea("Introduction", { inline: true }),
    ctaLabel: f.text("Button words", { inline: true }),
    cta: f.link("Button goes to"),
    picks: f.array("Swatches along the foot", { pick: f.colourway("Colourway") }, { summary: (it) => it.pick?.split("/").slice(1).join(" · ") || "Swatch", add: { pick: "" }, max: 14 }),
    showNav: f.toggle("Menu on the printed rule"),
  },
  defaultProps: { label: "Shruchi Jaiswal, textile designer", role: "Design Lead at The Yellow Dwelling", intro: "", ctaLabel: "Open the collections", cta: { href: "/collections" }, picks: [], showNav: true },
  render: ({ label, role, intro, ctaLabel, cta, picks, showNav, puck }: HeroProps & PuckBits) => {
    const { site, collections } = puck.metadata;
    const items = picksToSwatches(collections, picks);
    return (
      <section className={`wrap card ${hero.card}`} aria-labelledby="hero-title" data-hero>
        <span className="card-hole" style={{ top: 18, left: 18 }} aria-hidden="true" />
        <div className={hero.rule}>
          <p className="t-label">{label}</p>
          {showNav ? <NavLinks links={site.nav} /> : null}
        </div>

        <SwatchPicker items={items} label="Swatches from her collections">
          <h1 id="hero-title" className={`t-wordmark ${hero.mark}`}>
            <Wordmark name={site.name} />
          </h1>
          <div className={hero.meta}>
            <span className={`t-deva ${hero.deva}`} lang="hi">
              {site.nameDevanagari}
            </span>
            {filled(role) ? <p className="t-label">{role}</p> : null}
          </div>

          <div className={hero.intro}>
            {filled(intro) ? <p className="t-lead">{intro}</p> : null}
            {filled(ctaLabel) && cta?.href ? (
              <SmartLink href={cta.href} newTab={cta.newTab} className={hero.cta}>
                {ctaLabel}
                <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
              </SmartLink>
            ) : null}
          </div>

          <figure className={hero.viewer}>
            <SwatchWindow className={hero.window} sizes="(max-width: 860px) 92vw, 30vw" preload />
            <figcaption className={hero.caption}>
              <SwatchCaption />
              <SwatchShopLink shopName={site.shop.name} />
            </figcaption>
          </figure>

          <SwatchChips className={hero.chips} sizes="(max-width: 860px) 30vw, 9vw" />
        </SwatchPicker>
      </section>
    );
  },
};

// --------------------------------------------------------------- PageTitle

type PageTitleProps = L & { title: TextValue; lede: TextValue; facts: { label: string; value: string }[]; back: LinkValue; backLabel: string };

export const PageTitle = {
  label: "Page title",
  description: "The page's main heading with an introduction, and optional fact rows below.",
  keywords: ["title", "header", "h1", "intro", "heading"],
  fields: {
    title: f.text("Title", { inline: true }),
    lede: f.textarea("Introduction", { inline: true }),
    facts: f.array("Facts", { label: f.text("Label"), value: f.text("Detail") }, { summary: (r) => r.label || "Row", add: { label: "Label", value: "Detail" } }),
    backLabel: f.text("Back link words"),
    back: f.link("Back link goes to"),
    layout: f.layout(),
  },
  defaultProps: { title: "A new page", lede: "", facts: [], backLabel: "", back: { href: "" }, layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  render: ({ title, lede, facts, back, backLabel, layout, puck }: PageTitleProps & PuckBits) => (
    <Frame layout={layout} className={index.page}>
      {back?.href && backLabel ? (
        <SmartLink href={back.href} className={`t-label ${coll.back}`}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          {backLabel}
        </SmartLink>
      ) : null}
      <header className={facts?.length ? practice.header : index.head} style={facts?.length ? { marginBottom: "clamp(32px, 4.6vw, 64px)" } : undefined}>
        <h1 className="t-display">{display(counts(title, puck.metadata))}</h1>
        {filled(lede) ? <p className={`t-lead ${facts?.length ? "" : index.lede}`}>{counts(lede, puck.metadata)}</p> : null}
        {facts?.length ? (
          <dl className={practice.facts}>
            {facts.map((fct, i) => (
              <div key={i} className={practice.fact}>
                <dt className="t-label">{fct.label}</dt>
                <dd>{fct.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>
    </Frame>
  ),
};

// ---------------------------------------------------------- CollectionCards

type CardsProps = L & { show: "all" | "choose"; chosen: { collection: string }[]; level: "h2" | "h3" };

function chosenCollections(meta: SiteMeta, show: string, chosen: { collection: string }[]): Collection[] {
  if (show !== "choose") return meta.collections;
  return (chosen ?? []).map((c) => meta.collections.find((x) => x.slug === c.collection)).filter((c): c is Collection => Boolean(c));
}

export const CollectionCards = {
  label: "Collection cards",
  description: "Her collections as a swatch book: each card sticks as you scroll and the next slides over it.",
  keywords: ["collections", "stack", "cards", "catalogue", "yellow dwelling"],
  fields: {
    show: f.choice("Show", [
      { label: "Every collection", value: "all" },
      { label: "Choose", value: "choose" },
    ]),
    chosen: f.array("Collections", { collection: f.collection("Collection") }, { summary: (c) => c.collection || "Collection", add: { collection: "" } }),
    level: f.choice("Names are", [
      { label: "Sub-headings", value: "h3" },
      { label: "Headings", value: "h2" },
    ]),
    layout: f.layout(),
  },
  defaultProps: { show: "all", chosen: [], level: "h3", layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  resolveFields: (data: { props: CardsProps }, { fields }: { fields: Record<string, unknown> }) => {
    if (data.props.show === "choose") return fields;
    const { chosen: _c, ...rest } = fields;
    return rest;
  },
  render: ({ show, chosen, level, layout, puck }: CardsProps & PuckBits) => {
    const Heading = level;
    const list = chosenCollections(puck.metadata, show, chosen);
    return (
      <Frame layout={layout}>
        <ol className={stack.stack}>
          {list.map((c, n) => (
            <li key={c.slug} className={stack.item} style={{ "--n": n } as CSSProperties}>
              <Link href={toHref(collectionPath(puck.metadata, c.slug))} className={`card ${stack.card}`} data-on={bandText(c.band)}>
                <ViewTransition name={`band-${c.slug}`} share="morph" default="none">
                  <div className={stack.band} style={{ backgroundColor: c.band }}>
                    <span className="card-hole" style={{ top: 14, left: 14 }} aria-hidden="true" />
                    <Heading className={`t-display ${stack.name}`}>{kern(c.name)}</Heading>
                    <span className={`t-label ${stack.season}`}>{c.season}</span>
                  </div>
                </ViewTransition>
                <div className={stack.body}>
                  <div className={stack.text}>
                    {c.line ? <p className={stack.line}>{c.line}</p> : null}
                    <p className="t-body">{c.intro}</p>
                    <p className="t-shade">
                      {c.designs.length} designs, {colourwayCount(c)} colourways
                    </p>
                  </div>
                  <ul className={stack.strip} aria-hidden="true">
                    {c.designs.slice(0, 10).map((d, i) => (d.colourways[0] ? (
                      <li key={d.slug}>
                        <Swatch chip={d.colourways[0].chip} index={i + n} sizes="(max-width: 700px) 18vw, 7vw" />
                      </li>
                    ) : null))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Frame>
    );
  },
};

// --------------------------------------------------------------- ShadeBoard

type BoardProps = L & { show: "all" | "choose"; chosen: { collection: string }[] };

export const ShadeBoard = {
  label: "Shade board",
  description: "Every colourway on one mounted board, a printed row per collection.",
  keywords: ["mosaic", "all swatches", "colours", "palette", "board"],
  fields: {
    show: f.choice("Show", [
      { label: "Every collection", value: "all" },
      { label: "Choose", value: "choose" },
    ]),
    chosen: f.array("Collections", { collection: f.collection("Collection") }, { summary: (c) => c.collection || "Collection", add: { collection: "" } }),
    layout: f.layout(),
  },
  defaultProps: { show: "all", chosen: [], layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  resolveFields: CollectionCards.resolveFields,
  render: ({ show, chosen, layout, puck }: BoardProps & PuckBits) => {
    let n = 0;
    return (
      <Frame layout={layout}>
        <div className={`card ${mosaic.board}`}>
          <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
          {chosenCollections(puck.metadata, show, chosen).map((c) => {
            const path = collectionPath(puck.metadata, c.slug);
            return (
              <section key={c.slug} className={mosaic.group} aria-labelledby={`board-${c.slug}`}>
                <header className={mosaic.label}>
                  <span className={mosaic.band} style={{ backgroundColor: c.band }} aria-hidden="true" />
                  <h3 id={`board-${c.slug}`} className={mosaic.name}>
                    <Link href={toHref(path)}>{kern(c.name)}</Link>
                  </h3>
                  <p className="t-shade">{c.season}</p>
                </header>
                <ul className={mosaic.chips}>
                  {c.designs.flatMap((d) =>
                    d.colourways.map((cw) => (
                      <li key={`${d.slug}-${cw.id}`}>
                        <Link href={toHref(`${path}#${d.slug}`)} className={mosaic.link} aria-label={`${d.name} in ${cw.name}`} title={`${d.name}, ${cw.name}`}>
                          <Swatch chip={cw.chip} index={n++} sizes="72px" />
                        </Link>
                      </li>
                    )),
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </Frame>
    );
  },
};

// -------------------------------------------------------------- StudySheets

type SheetsProps = L & { items: { study: string; size: "wide" | "sheet" | "small" }[]; others: "small" | "hide"; level: "h2" | "h3" };

export const StudySheets = {
  label: "Study sheets",
  description: "Her studies as development sheets: a mounted plate, the title, and the craft printed along the foot.",
  keywords: ["studies", "projects", "portfolio", "index", "behance", "grid"],
  fields: {
    items: f.array(
      "Studies, in order",
      {
        study: f.study("Study"),
        size: f.choice("Size", [
          { label: "Wide", value: "wide" },
          { label: "Sheet", value: "sheet" },
          { label: "Small", value: "small" },
        ]),
      },
      { summary: (it) => it.study || "Study", add: { study: "", size: "sheet" } },
    ),
    others: f.choice("Studies not listed", [
      { label: "Show small", value: "small" },
      { label: "Hide", value: "hide" },
    ]),
    level: f.choice("Titles are", [
      { label: "Sub-headings", value: "h3" },
      { label: "Headings", value: "h2" },
    ]),
    layout: f.layout(),
  },
  defaultProps: { items: [], others: "small", level: "h3", layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  render: ({ items, others, level, layout, puck }: SheetsProps & PuckBits) => {
    const Heading = level;
    const all = puck.metadata.studies;
    const byId = new Map(all.map((s) => [s.id, s]));
    const listed = (items ?? []).map((it) => ({ s: byId.get(it.study), size: it.size })).filter((x): x is { s: StudySummary; size: "wide" | "sheet" | "small" } => Boolean(x.s));
    const seen = new Set(listed.map((x) => x.s.id));
    const featured = listed.filter((x) => x.size !== "small");
    const small = [...listed.filter((x) => x.size === "small").map((x) => x.s), ...(others === "small" ? all.filter((s) => !seen.has(s.id)) : [])];

    return (
      <Frame layout={layout}>
        <div className={sheets.index}>
          {featured.length ? (
            <ul className={sheets.featured}>
              {featured.map(({ s, size }) => {
                const wide = size === "wide";
                return (
                  <li key={s.id} className={wide ? sheets.wide : undefined}>
                    <Link href={toHref(s.path)} className={`card ${sheets.sheet}`}>
                      <span className="card-hole" style={{ top: 14, left: 14 }} aria-hidden="true" />
                      <ViewTransition name={`study-${s.id}`} share="morph" default="none">
                        <div className={sheets.plate} style={{ backgroundColor: s.cover?.color, aspectRatio: wide ? "3 / 2" : "4 / 5" }}>
                          <Pic photo={s.cover} alt="" sizes={wide ? "(max-width: 760px) 90vw, 46vw" : "(max-width: 760px) 90vw, 22vw"} />
                        </div>
                      </ViewTransition>
                      <div className={sheets.meta}>
                        <Heading className="t-title">{kern(s.title)}</Heading>
                        <p className={sheets.hook}>{s.hook}</p>
                      </div>
                      {s.credits.length ? (
                        <dl className={sheets.credits}>
                          {s.credits.slice(0, 2).map((c, i) => (
                            <div key={i}>
                              <dt className="t-label">{c.label}</dt>
                              <dd>{c.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {small.length ? (
            <ul className={sheets.rest}>
              {small.map((s) => (
                <li key={s.id}>
                  <Link href={toHref(s.path)} className={`card ${sheets.small}`}>
                    <ViewTransition name={`study-${s.id}`} share="morph" default="none">
                      <div className={sheets.thumb} style={{ backgroundColor: s.cover?.color }}>
                        <Pic photo={s.cover} alt="" sizes="(max-width: 760px) 30vw, 9vw" />
                      </div>
                    </ViewTransition>
                    <span className={sheets.smallText}>
                      <Heading className={sheets.smallTitle}>{kern(s.title)}</Heading>
                      <span className={sheets.smallHook}>{s.hook}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Frame>
    );
  },
};

// ------------------------------------------------------------- ProcessSteps

type StepsProps = L & { steps: { verb: string; photo: Photo | null; text: string }[]; moreLabel: string; more: LinkValue };

export const ProcessSteps = {
  label: "Process steps",
  description: "One project followed step by step, from what she looked at to the cloth it became.",
  keywords: ["process", "steps", "how", "method", "look draw make", "timeline"],
  fields: {
    steps: f.array("Steps", { verb: f.text("Word"), photo: f.photo("Photo"), text: f.textarea("Text") }, { summary: (s) => s.verb || "Step", add: { verb: "Step", photo: null, text: "" }, max: 6 }),
    moreLabel: f.text("Link words"),
    more: f.link("Link goes to"),
    layout: f.layout(),
  },
  defaultProps: { steps: [], moreLabel: "How she works", more: { href: "/practice" }, layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  render: ({ steps, moreLabel, more, layout }: StepsProps & PuckBits) => (
    <Frame layout={layout}>
      <div className={process.strip}>
        <ol className={process.steps} style={{ "--steps": Math.max(steps?.length ?? 3, 1) } as CSSProperties}>
          {(steps ?? []).map((s, i) => (
            <li key={i} className={process.step}>
              <div className={process.frame} style={{ backgroundColor: s.photo?.color }}>
                <Pic photo={s.photo} sizes="(max-width: 760px) 92vw, 30vw" />
              </div>
              <p className={process.verb}>{s.verb}</p>
              <p className={process.text}>{s.text}</p>
            </li>
          ))}
        </ol>
        {more?.href && moreLabel ? (
          <SmartLink href={more.href} className={`t-label ${process.more}`}>
            {moreLabel}
            <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
          </SmartLink>
        ) : null}
      </div>
    </Frame>
  ),
};

// -------------------------------------------------------------- PracticeWay

type WayProps = L & { verb: TextValue; summary: TextValue; examples: { photo: Photo | null; text: string; link: LinkValue }[] };

export const PracticeWay = {
  label: "Big word with examples",
  description: "One large word (Look, Draw, Make) with a line about it and three linked examples.",
  keywords: ["practice", "verb", "examples", "method", "approach"],
  fields: {
    verb: f.text("Big word", { inline: true }),
    summary: f.textarea("Line beside it", { inline: true }),
    examples: f.array("Examples", { photo: f.photo("Photo"), text: f.textarea("Text"), link: f.link("Links to") }, { summary: (e) => e.text?.slice(0, 40) || "Example", add: { photo: null, text: "", link: { href: "" } }, max: 6 }),
    layout: f.layout(),
  },
  defaultProps: { verb: "Look", summary: "", examples: [], layout: { width: "wide", space: "xl", show: "all", motion: "none" } },
  render: ({ verb, summary, examples, layout }: WayProps & PuckBits) => (
    <Frame layout={layout} as="section" className={practice.way} style={{ paddingTop: 0 }}>
      <div className={practice.wayHead}>
        <h2 className={practice.verb}>{display(verb)}</h2>
        {filled(summary) ? <p className={`t-lead ${practice.summary}`}>{summary}</p> : null}
      </div>
      <ul className={practice.examples}>
        {(examples ?? []).map((ex, i) => (
          <li key={i}>
            <SmartLink href={ex.link?.href ?? ""} className={practice.example}>
              <span className={practice.frame} style={{ backgroundColor: ex.photo?.color }}>
                <Pic photo={ex.photo} sizes="(max-width: 760px) 92vw, 30vw" />
              </span>
              <span className={practice.exText}>{ex.text}</span>
            </SmartLink>
          </li>
        ))}
      </ul>
    </Frame>
  ),
};

// ------------------------------------------------------------------- Quotes

type QuotesProps = L & { title: TextValue; quotes: { quote: string; from: string; link: LinkValue }[] };

export const Quotes = {
  label: "Quotes row",
  description: "Up to three of her sentences side by side, in Bodoni italic.",
  keywords: ["quotes", "testimonials", "words", "voice"],
  fields: {
    title: f.text("Heading", { inline: true }),
    quotes: f.array("Quotes", { quote: f.textarea("Quote"), from: f.text("From"), link: f.link("Links to") }, { summary: (q) => q.from || "Quote", add: { quote: "", from: "", link: { href: "" } }, max: 6 }),
    layout: f.layout(),
  },
  defaultProps: { title: "In her words", quotes: [], layout: { width: "wide", space: "xl", show: "all", motion: "none" } },
  render: ({ title, quotes, layout }: QuotesProps & PuckBits) => (
    <Frame layout={layout} as="section" className={practice.words} style={{ paddingTop: 0 }}>
      {filled(title) ? <h2 className="t-display">{display(title)}</h2> : null}
      <div className={practice.quotes}>
        {(quotes ?? []).map((q, i) => (
          <figure key={i} className={practice.quote}>
            <blockquote>
              <p>&ldquo;{q.quote}&rdquo;</p>
            </blockquote>
            {q.from ? (
              <figcaption className="t-label">
                {q.link?.href ? <SmartLink href={q.link.href}>{q.from}</SmartLink> : q.from}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Frame>
  ),
};

// ---------------------------------------------------------- CollectionCard

type CollectionCardProps = L & { collection: string; showIndex: boolean; note: string; extra: (p: { className?: string; minEmptyHeight?: number }) => React.ReactNode };

export const CollectionCard = {
  label: "Collection card",
  description: "A whole collection: its colour band, tagline and introduction, then every design with its colourways and room photos.",
  keywords: ["collection", "designs", "colourways", "products", "catalogue"],
  fields: {
    collection: f.collection("Collection", { allowPage: true }),
    note: f.textarea("Small print under the introduction"),
    showIndex: f.toggle("List the designs as quick links"),
    extra: f.slot(),
    layout: f.layout(),
  },
  defaultProps: {
    collection: "",
    note: "{count}. Designed by Shruchi as Design Lead at The Yellow Dwelling; descriptions are the shop's own.",
    showIndex: true,
    extra: [],
    layout: { width: "wide", space: "none", show: "all", motion: "none" },
  },
  render: ({ collection, showIndex, note, extra: Extra, layout, puck }: CollectionCardProps & PuckBits) => {
    const c = collectionFor(puck.metadata, collection);
    if (!c) return <Frame layout={layout}><p className={styles.placeholder}>Add a collection in the Collections panel first.</p></Frame>;
    const count = `${c.designs.length} designs, ${colourwayCount(c)} colourways`;
    return (
      <Frame layout={layout}>
        <article className={`card ${coll.card}`} data-on={bandText(c.band)}>
          <ViewTransition name={`band-${c.slug}`} share="morph" default="none">
            <header className={coll.band} style={{ backgroundColor: c.band }}>
              <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
              <h1 className={`t-wordmark ${coll.name}`}>{kern(c.name)}</h1>
              <p className={`t-label ${coll.season}`}>{c.season}</p>
            </header>
          </ViewTransition>

          <div className={coll.intro}>
            {c.line ? <p className={coll.line}>{c.line}</p> : null}
            {c.intro ? <p className="t-lead">{c.intro}</p> : null}
            {note ? <p className="t-shade">{note.replaceAll("{count}", count)}</p> : null}
          </div>

          <div className={`${coll.intro} bx-slot`} style={{ paddingTop: 0 }}>
            <Extra className="bx-slot" minEmptyHeight={puck.isEditing ? 60 : 0} />
          </div>

          {showIndex ? (
            <nav className={coll.index} aria-label={`Designs in ${c.name}`}>
              <ul>
                {c.designs.map((d) => (
                  <li key={d.slug}>
                    <a href={`#${d.slug}`} className="t-label">
                      {d.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className={coll.rows}>
            {c.designs.map((d, i) => {
              const items = d.colourways.map((cw) => toSwatchItem(c, d, cw));
              const many = items.length > 1;
              if (!items.length) return null;
              return (
                <article key={d.slug} id={d.slug} className={row.row} data-single={many ? undefined : ""} aria-labelledby={`${d.slug}-name`}>
                  <SwatchPicker items={items} label={`${d.name} colourways`}>
                    <div className={row.text}>
                      <header className={row.head}>
                        <h2 id={`${d.slug}-name`} className="t-title">
                          {kern(d.name)}
                        </h2>
                        <p className="t-label">
                          {d.technique}
                          {many ? `, ${items.length} colourways` : null}
                        </p>
                      </header>
                      {d.story ? <p className={`t-body ${row.story}`}>{d.story}</p> : null}
                      <SwatchChips className={row.chips} sizes={many ? "(max-width: 860px) 26vw, 8vw" : "260px"} labels="colourway" />
                      <SwatchShopLink shopName={puck.metadata.site.shop.name} />
                    </div>
                    <SwatchWindow className={row.window} sizes="(max-width: 860px) 92vw, 40vw" preload={i === 0} />
                  </SwatchPicker>
                </article>
              );
            })}
          </div>
        </article>
      </Frame>
    );
  },
};

// --------------------------------------------------------- CollectionPager

type PagerProps = L & { collection: string };

export const CollectionPager = {
  label: "Previous and next collection",
  description: "Links to the collections either side of this one.",
  keywords: ["pager", "next", "previous", "navigation"],
  fields: { collection: f.collection("Collection", { allowPage: true }), layout: f.layout() },
  defaultProps: { collection: "", layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  render: ({ collection, layout, puck }: PagerProps & PuckBits) => {
    const all = puck.metadata.collections;
    const c = collectionFor(puck.metadata, collection);
    if (!c || all.length < 2) return <Frame layout={layout}>{null}</Frame>;
    const at = all.findIndex((x) => x.slug === c.slug);
    const prev = all[(at - 1 + all.length) % all.length];
    const next = all[(at + 1) % all.length];
    return (
      <Frame layout={layout}>
        <nav className={coll.pager} aria-label="Other collections">
          <Link href={toHref(collectionPath(puck.metadata, prev.slug))} className={coll.pagerLink}>
            <span className="t-label">
              <ArrowLeftIcon size={13} weight="bold" aria-hidden="true" /> Previous card
            </span>
            <span className={coll.pagerName}>
              <span className={coll.dot} style={{ backgroundColor: prev.band }} aria-hidden="true" />
              {kern(prev.name)}
            </span>
          </Link>
          <Link href={toHref(collectionPath(puck.metadata, next.slug))} className={`${coll.pagerLink} ${coll.pagerNext}`}>
            <span className="t-label">
              Next card <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
            </span>
            <span className={coll.pagerName}>
              <span className={coll.dot} style={{ backgroundColor: next.band }} aria-hidden="true" />
              {kern(next.name)}
            </span>
          </Link>
        </nav>
      </Frame>
    );
  },
};

// ----------------------------------------------------------------- BackLink

type BackProps = L & { label: TextValue; link: LinkValue };

export const BackLink = {
  label: "Back link",
  description: "A small printed link back, like All collections.",
  keywords: ["back", "breadcrumb", "return"],
  fields: { label: f.text("Words", { inline: true }), link: f.link("Goes to"), layout: f.layout() },
  defaultProps: { label: "All collections", link: { href: "/collections" }, layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  render: ({ label, link, layout }: BackProps & PuckBits) => (
    <Frame layout={layout} style={{ paddingTop: 18 }}>
      <SmartLink href={link?.href ?? "/"} className={`t-label ${coll.back}`}>
        <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
        {label}
      </SmartLink>
    </Frame>
  ),
};

// -------------------------------------------------------------- StudyHeader

type StudyHeaderProps = L & { title: TextValue; hook: TextValue; credits: { label: string; value: string }[]; cover: Photo | null; coverShape: "wide" | "tall" | "none" };

export const StudyHeader = {
  label: "Study header",
  description: "A study's title, one-line hook, credits and cover photo. The studies index reads from this.",
  keywords: ["study", "project", "header", "cover", "case study"],
  fields: {
    title: f.text("Title", { inline: true }),
    hook: f.textarea("One line about it", { inline: true }),
    credits: f.array("Credits", { label: f.text("Label"), value: f.text("Detail") }, { summary: (r) => r.label || "Credit", add: { label: "Craft", value: "" } }),
    cover: f.photo("Cover photo", "Also used on the study's sheet in the index."),
    coverShape: f.choice("Cover", [
      { label: "Wide", value: "wide" },
      { label: "Tall", value: "tall" },
      { label: "Hide", value: "none" },
    ]),
    layout: f.layout(),
  },
  defaultProps: { title: "A new study", hook: "", credits: [], cover: null, coverShape: "wide", layout: { width: "wide", space: "none", show: "all", motion: "none" } },
  render: ({ title, hook, credits, cover, coverShape, layout, puck }: StudyHeaderProps & PuckBits) => (
    <Frame layout={layout}>
      <header className={study.header}>
        <div className={study.titles}>
          <h1 className="t-display">{display(title)}</h1>
          {filled(hook) ? <p className={`t-lead ${study.hook}`}>{hook}</p> : null}
        </div>
        {credits?.length ? (
          <dl className={study.credits}>
            {credits.map((c, i) => (
              <div key={i} className={study.credit}>
                <dt className="t-label">{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>
      {coverShape !== "none" ? (
        <ViewTransition name={`study-${puck.metadata.page.id}`} share="morph" default="none">
          <div className={study.cover} style={{ backgroundColor: cover?.color, aspectRatio: coverShape === "tall" ? "4 / 5" : undefined, maxWidth: coverShape === "tall" ? 720 : undefined }}>
            <Pic photo={cover} alt={cover?.alt || (typeof title === "string" ? `${title}${typeof hook === "string" && hook ? `: ${hook}` : ""}` : "")} sizes="(max-width: 900px) 94vw, 1440px" preload />
          </div>
        </ViewTransition>
      ) : null}
    </Frame>
  ),
};

// -------------------------------------------------------------- StudyFooter

type StudyFooterProps = L & { note: TextValue; sources: { label: string; href: string }[]; showNext: boolean };

export const StudyFooter = {
  label: "Study footer",
  description: "Where the words and images come from, and a link to the next study.",
  keywords: ["footer", "next", "source", "credit", "behance"],
  fields: {
    note: f.text("Source note", { inline: true }),
    sources: f.array("Source links", { label: f.text("Words"), href: f.text("Web address") }, { summary: (s) => s.label || "Link", add: { label: "See the original", href: "" } }),
    showNext: f.toggle("Link to the next study"),
    layout: f.layout(),
  },
  defaultProps: { note: "Words and images from Shruchi's Behance.", sources: [], showNext: true, layout: { width: "text", space: "l", show: "all", motion: "none" } },
  render: ({ note, sources, showNext, layout, puck }: StudyFooterProps & PuckBits) => {
    const all = puck.metadata.studies;
    const at = all.findIndex((s) => s.id === puck.metadata.page.id);
    const next = all.length > 1 ? all[(at + 1) % all.length] : null;
    return (
      <Frame layout={layout}>
        <footer className={study.foot} style={{ margin: 0 }}>
          {filled(note) || sources?.length ? (
            <p className={study.source}>
              {note}{" "}
              {(sources ?? []).map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener" className={study.inline}>
                  {s.label}
                  <ArrowUpRightIcon size={12} weight="bold" aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ))}
            </p>
          ) : null}
          {showNext && next && next.id !== puck.metadata.page.id ? (
            <Link href={toHref(next.path)} className={study.next}>
              <span className="t-label">
                Next study <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
              </span>
              <span className={study.nextName}>{kern(next.title)}</span>
            </Link>
          ) : null}
        </footer>
      </Frame>
    );
  },
};

// ---------------------------------------------------------- StudyImages

type StudyImagesProps = L & { photos: { photo: Photo | null }[]; title: string };

/** Study photographs at their own proportions, one to three across. */
export const StudyImages = {
  label: "Photos at full size",
  description: "Photos shown whole, at their own proportions, one to three across. Good for process sheets.",
  keywords: ["images", "photos", "sheet", "process", "full"],
  fields: {
    photos: f.array("Photos", { photo: f.photo("Photo") }, { summary: (p) => p.photo?.alt || "Photo", add: { photo: null } }),
    title: f.text("Describe them", { placeholder: "e.g. Sura, motif exploration" }),
    layout: f.layout(),
  },
  defaultProps: { photos: [], title: "", layout: { width: "text", space: "s", show: "all", motion: "none" } },
  render: ({ photos, title, layout }: StudyImagesProps & PuckBits) => {
    const list = (photos ?? []).map((p) => p.photo).filter((p): p is Photo => Boolean(p?.src));
    const n = list.length;
    const cols = n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3;
    if (!n) return <Frame layout={layout}><p className={styles.placeholder}>Add photos in the settings panel.</p></Frame>;
    return (
      <Frame layout={layout}>
        <div className={study.images} data-cols={cols} style={{ marginBlock: 0 }}>
          {list.map((img, i) => (
            <NaturalPic key={`${img.src}-${i}`} photo={img} alt={img.alt || (n > 1 ? `${title}, ${i + 1} of ${n}` : title)} sizes={cols === 1 ? "(max-width: 900px) 94vw, 1100px" : `(max-width: 900px) 94vw, ${Math.round(100 / cols)}vw`} className={study.img} />
          ))}
        </div>
      </Frame>
    );
  },
};

export const portfolioBlocks = { HomeHero, PageTitle, CollectionCards, ShadeBoard, StudySheets, ProcessSteps, PracticeWay, Quotes, CollectionCard, CollectionPager, BackLink, StudyHeader, StudyFooter, StudyImages };
