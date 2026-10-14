import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { f, opts } from "./fields";
import { counts, display, filled, Frame, SmartLink, type LayoutProps, type LinkValue, type TextValue } from "./shared";
import type { PuckBits } from "./types";
import styles from "./blocks.module.css";

type L = { layout: LayoutProps };

// ----------------------------------------------------------------- Heading

type HeadingProps = L & { text: TextValue; size: "hero" | "display" | "title" | "small"; level: "h1" | "h2" | "h3" | "p"; align: "start" | "center" };

export const Heading = {
  label: "Heading",
  description: "A title in the site's display type, from hero size down to small.",
  keywords: ["title", "headline", "header"],
  fields: {
    text: f.text("Words", { inline: true }),
    size: f.choice("Size", opts.heading),
    level: f.choice("Importance", [
      { label: "Page title", value: "h1" },
      { label: "Section", value: "h2" },
      { label: "Sub-section", value: "h3" },
      { label: "Decorative", value: "p" },
    ]),
    align: f.choice("Align", opts.align),
    layout: f.layout(),
  },
  defaultProps: { text: "A new heading", size: "display", level: "h2", align: "start", layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ text, size, level, align, layout, puck }: HeadingProps & PuckBits) => {
    const Tag = level;
    return (
      <Frame layout={layout} className={align === "center" ? styles["align-center"] : undefined}>
        <Tag className={styles.heading} data-size={size}>
          {display(counts(text, puck.metadata))}
        </Tag>
      </Frame>
    );
  },
};

// -------------------------------------------------------------------- Text

type TextProps = L & { text: TextValue; style: "body" | "lead" | "quiet"; align: "start" | "center"; measure: "normal" | "wide" };

export const Text = {
  label: "Text",
  description: "Paragraphs with bold, italic, links and lists. Click on the page and type.",
  keywords: ["paragraph", "body", "copy", "words", "list", "rich text"],
  fields: {
    text: f.rich("Text"),
    style: f.choice("Style", [
      { label: "Reading", value: "body" },
      { label: "Introduction", value: "lead" },
      { label: "Quiet", value: "quiet" },
    ]),
    align: f.choice("Align", opts.align),
    measure: f.choice("Line length", [
      { label: "Comfortable", value: "normal" },
      { label: "Full width", value: "wide" },
    ]),
    layout: f.layout(),
  },
  defaultProps: {
    text: "<p>Write something here. Select words to make them bold, italic or a link.</p>",
    style: "body",
    align: "start",
    measure: "normal",
    layout: { width: "wide", space: "s", show: "all", motion: "none" },
  },
  render: ({ text, style, align, measure, layout, puck }: TextProps & PuckBits) => (
    <Frame layout={layout} className={align === "center" ? styles["align-center"] : undefined}>
      <div className={styles.text} data-style={style} data-measure={measure}>
        {typeof text === "string" ? <div dangerouslySetInnerHTML={{ __html: String(counts(text, puck.metadata)) }} /> : text}
      </div>
    </Frame>
  ),
};

// ----------------------------------------------------------------- Tagline

type TaglineProps = L & { text: TextValue; size: "m" | "l"; align: "start" | "center" };

export const Tagline = {
  label: "Tagline",
  description: "One line in Bodoni italic, like a collection's motto.",
  keywords: ["italic", "motto", "line", "subtitle"],
  fields: {
    text: f.text("Words", { inline: true }),
    size: f.choice("Size", [
      { label: "Regular", value: "m" },
      { label: "Large", value: "l" },
    ]),
    align: f.choice("Align", opts.align),
    layout: f.layout(),
  },
  defaultProps: { text: "Rooted, royal, reimagined.", size: "m", align: "start", layout: { width: "wide", space: "s", show: "all", motion: "none" } },
  render: ({ text, size, align, layout }: TaglineProps & PuckBits) => (
    <Frame layout={layout} className={align === "center" ? styles["align-center"] : undefined}>
      <p className={styles.tagline} data-size={size}>
        {text}
      </p>
    </Frame>
  ),
};

// ------------------------------------------------------------------- Quote

type QuoteProps = L & { quote: TextValue; from: TextValue; link: LinkValue };

export const Quote = {
  label: "Quote",
  description: "Her words, set in italic with where they come from.",
  keywords: ["quotation", "words", "testimonial", "citation"],
  fields: {
    quote: f.textarea("Quote", { inline: true }),
    from: f.text("From", { inline: true }),
    link: f.link("Links to"),
    layout: f.layout(),
  },
  defaultProps: { quote: "A sentence in her own words.", from: "Where it is from", link: { href: "" }, layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ quote, from, link, layout }: QuoteProps & PuckBits) => (
    <Frame layout={layout} as="figure">
      <div className={styles.quote}>
        <blockquote>
          <p>
            &ldquo;{quote}&rdquo;
          </p>
        </blockquote>
        {filled(from) ? (
          <figcaption className="t-label">
            {link?.href ? (
              <SmartLink href={link.href} newTab={link.newTab}>
                {from}
              </SmartLink>
            ) : (
              from
            )}
          </figcaption>
        ) : null}
      </div>
    </Frame>
  ),
};

// ---------------------------------------------------------------- Keywords

type KeywordsProps = L & { items: { label: string }[] };

export const Keywords = {
  label: "Keyword tags",
  description: "Small printed tags: crafts, materials, places.",
  keywords: ["tags", "chips", "labels", "craft"],
  fields: {
    items: f.array("Tags", { label: f.text("Tag") }, { summary: (i) => i.label || "Tag", add: { label: "New tag" } }),
    layout: f.layout(),
  },
  defaultProps: { items: [{ label: "Ajrak" }, { label: "Block printing" }, { label: "Indigo" }], layout: { width: "wide", space: "s", show: "all", motion: "none" } },
  render: ({ items, layout }: KeywordsProps & PuckBits) => (
    <Frame layout={layout}>
      <ul className={styles.keywords} aria-label="Keywords">
        {items.map((k, i) => (
          <li key={i} className="t-label">
            {k.label}
          </li>
        ))}
      </ul>
    </Frame>
  ),
};

// ------------------------------------------------------------------- Facts

type FactsProps = L & { rows: { label: string; value: string }[] };

export const Facts = {
  label: "Facts list",
  description: "Label and detail rows, like Craft: Ajrak block printing.",
  keywords: ["credits", "details", "specification", "list", "info"],
  fields: {
    rows: f.array("Rows", { label: f.text("Label"), value: f.text("Detail") }, { summary: (r) => r.label || "Row", add: { label: "Label", value: "Detail" } }),
    layout: f.layout(),
  },
  defaultProps: {
    rows: [
      { label: "Craft", value: "Ajrak block printing" },
      { label: "Made", value: "Motifs, blocks, print samples" },
    ],
    layout: { width: "wide", space: "m", show: "all", motion: "none" },
  },
  render: ({ rows, layout }: FactsProps & PuckBits) => (
    <Frame layout={layout}>
      <dl className={styles.facts}>
        {rows.map((r, i) => (
          <div key={i} className={styles.fact}>
            <dt className="t-label">{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </Frame>
  ),
};

// ------------------------------------------------------------------ Button

type ButtonProps = L & { label: TextValue; link: LinkValue; style: "solid" | "text"; align: "start" | "center" | "end" };

export const Button = {
  label: "Button",
  description: "A link people press: solid ink, or underlined printed caps.",
  keywords: ["link", "call to action", "cta", "arrow"],
  fields: {
    label: f.text("Words", { inline: true }),
    link: f.link("Goes to"),
    style: f.choice("Style", [
      { label: "Solid", value: "solid" },
      { label: "Underlined", value: "text" },
    ]),
    align: f.choice("Align", opts.align3),
    layout: f.layout(),
  },
  defaultProps: { label: "Open the collections", link: { href: "/collections" }, style: "solid", align: "start", layout: { width: "wide", space: "s", show: "all", motion: "none" } },
  render: ({ label, link, style, align, layout }: ButtonProps & PuckBits) => {
    const external = /^https?:/.test(link?.href ?? "") || link?.newTab;
    const Icon = external ? ArrowUpRightIcon : ArrowRightIcon;
    return (
      <Frame layout={layout}>
        <div className={styles.buttonRow} data-align={align}>
          <SmartLink href={link?.href ?? ""} newTab={link?.newTab} className={style === "solid" ? styles.solid : `t-label ${styles.textLink}`}>
            {label}
            <Icon size={style === "solid" ? 18 : 13} weight="bold" aria-hidden="true" />
          </SmartLink>
        </div>
      </Frame>
    );
  },
};

export const textBlocks = { Heading, Text, Tagline, Quote, Keywords, Facts, Button };
