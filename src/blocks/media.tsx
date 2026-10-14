import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Swatch } from "@/components/Swatch";
import { SwatchCaption, SwatchChips, SwatchPicker, SwatchShopLink, SwatchWindow } from "@/components/SwatchPicker";
import type { Photo } from "@/lib/content-types";
import { collectionPath, designSwatches, picksToSwatches, type SwatchItem } from "@/lib/library";
import { asset } from "@/lib/paths";
import { GalleryGrid, type GalleryItem } from "./client/GalleryGrid";
import { f, opts } from "./fields";
import { display, filled, Frame, Pic, ratioCss, SmartLink, type LayoutProps, type LinkValue, type Ratio, type TextValue } from "./shared";
import type { PuckBits } from "./types";
import styles from "./blocks.module.css";
import rowStyles from "@/components/DesignRow.module.css";
import practice from "./css/practice.module.css";

type L = { layout: LayoutProps };

const sizesFor = (width: LayoutProps["width"], size?: string) => {
  if (size === "s") return "360px";
  if (size === "m") return "(max-width: 700px) 92vw, 640px";
  if (width === "full") return "100vw";
  if (width === "text" || width === "narrow" || size === "l") return "(max-width: 1100px) 94vw, 1100px";
  return "(max-width: 1520px) 94vw, 1520px";
};

// ------------------------------------------------------------------- Image

type ImageProps = L & {
  photo: Photo | null;
  ratio: Ratio;
  size: "s" | "m" | "l" | "fill";
  frame: "plain" | "card" | "mounted" | "swatch";
  align: "start" | "center" | "end";
  caption: TextValue;
  link: LinkValue;
};

export const ImageBlock = {
  label: "Photo",
  description: "One photograph: crop it, choose its size and frame, add a caption or a link.",
  keywords: ["image", "picture", "photo", "figure"],
  fields: {
    photo: f.photo("Photo"),
    ratio: f.select("Shape", opts.ratio),
    size: f.choice("Size", [
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "Fill", value: "fill" },
    ]),
    frame: f.choice("Frame", [
      { label: "Plain", value: "plain" },
      { label: "Card", value: "card" },
      { label: "Mounted", value: "mounted" },
      { label: "Swatch", value: "swatch" },
    ]),
    align: f.choice("Align", opts.align3),
    caption: f.text("Caption", { inline: true }),
    link: f.link("Links to"),
    layout: f.layout(),
  },
  defaultProps: { photo: null, ratio: "auto", size: "fill", frame: "plain", align: "start", caption: "", link: { href: "" }, layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ photo, ratio, size, frame, align, caption, link, layout }: ImageProps & PuckBits) => {
    const shape = frame === "swatch" ? "1 / 1" : ratioCss(ratio, photo);
    const plate = (
      <span className={styles.plate} data-size={size} data-frame={frame} style={{ aspectRatio: shape, display: "block", backgroundColor: photo?.color }}>
        <Pic photo={photo} sizes={sizesFor(layout.width, size)} />
      </span>
    );
    return (
      <Frame layout={layout} as="figure" className={styles.figure} style={{ justifyItems: align }}>
        {link?.href ? (
          <SmartLink href={link.href} newTab={link.newTab} className={styles.plateLink}>
            {plate}
          </SmartLink>
        ) : (
          plate
        )}
        {filled(caption) ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      </Frame>
    );
  },
};

// ----------------------------------------------------------------- Gallery

type GalleryProps = L & {
  items: GalleryItem[];
  arrangement: "auto" | "grid" | "masonry" | "strip" | "feature";
  columns: number;
  ratio: Ratio;
  captions: boolean;
  lightbox: boolean;
  mobile: "one" | "two";
  title: string;
};

export const Gallery = {
  label: "Gallery",
  description: "A set of photos as a grid, a masonry wall or a sideways strip. Visitors can open them full screen.",
  keywords: ["images", "photos", "grid", "masonry", "carousel", "slideshow", "lightbox"],
  fields: {
    items: f.array("Photos", { photo: f.photo("Photo"), caption: f.text("Caption") }, { summary: (it) => it.caption || it.photo?.alt || "Photo", add: { photo: null, caption: "" } }),
    arrangement: f.choice("Arrangement", [
      { label: "Auto", value: "auto" },
      { label: "Grid", value: "grid" },
      { label: "Masonry", value: "masonry" },
      { label: "Strip", value: "strip" },
      { label: "Feature", value: "feature" },
    ]),
    columns: f.choice("Columns", [
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
      { label: "5", value: 5 },
    ]),
    ratio: f.select("Shape", opts.ratio),
    captions: f.toggle("Show captions"),
    lightbox: f.toggle("Open full screen", "Visitors can press a photo to see it large."),
    mobile: f.choice("On phones", [
      { label: "One across", value: "one" },
      { label: "Two across", value: "two" },
    ]),
    title: f.text("Describe the set", { placeholder: "Used for screen readers when a photo has no description" }),
    layout: f.layout(),
  },
  defaultProps: { items: [], arrangement: "auto", columns: 3, ratio: "auto", captions: true, lightbox: true, mobile: "one", title: "", layout: { width: "text", space: "s", show: "all", motion: "none" } },
  render: ({ items, arrangement, columns, ratio, captions, lightbox, mobile, title, layout, puck }: GalleryProps & PuckBits) => {
    const usable = (items ?? []).filter((it) => it.photo?.src);
    return (
      <Frame layout={layout}>
        {usable.length ? (
          <GalleryGrid items={usable} layout={arrangement} columns={Number(columns) || 3} ratio={ratio} captions={captions} lightbox={lightbox} mobile={mobile} title={title || puck.metadata?.page?.path || "Photo"} disabled={puck.isEditing} />
        ) : (
          <p className={styles.placeholder}>Add photos to this gallery in the settings panel.</p>
        )}
      </Frame>
    );
  },
};

// ------------------------------------------------------------------- Video

type VideoProps = L & { url: string; ratio: Ratio; caption: TextValue; loop: boolean };

function embedFor(url: string): { kind: "iframe" | "video"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?dnt=1` };
  const ig = url.match(/instagram\.com\/(p|reel)\/([\w-]+)/);
  if (ig) return { kind: "iframe", src: `https://www.instagram.com/${ig[1]}/${ig[2]}/embed` };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: "video", src: url };
  return null;
}

export const Video = {
  label: "Video",
  description: "A video from YouTube, Vimeo or Instagram, or one she uploads.",
  keywords: ["film", "youtube", "vimeo", "instagram", "reel", "embed", "movie"],
  fields: {
    url: f.video("Video"),
    ratio: f.select("Shape", opts.ratio.filter((o) => o.value !== "auto")),
    loop: f.toggle("Play silently on a loop", "For uploaded clips: plays muted and repeats, like a moving photograph."),
    caption: f.text("Caption", { inline: true }),
    layout: f.layout(),
  },
  defaultProps: { url: "", ratio: "16:9", loop: false, caption: "", layout: { width: "text", space: "m", show: "all", motion: "none" } },
  render: ({ url, ratio, loop, caption, layout }: VideoProps & PuckBits) => {
    const embed = embedFor(url);
    return (
      <Frame layout={layout} as="figure" className={styles.figure}>
        <div className={styles.video} style={{ aspectRatio: ratioCss(ratio) }}>
          {embed?.kind === "iframe" ? (
            <iframe src={embed.src} title={typeof caption === "string" && caption ? caption : "Video"} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          ) : embed?.kind === "video" ? (
            <video src={asset(embed.src)} controls={!loop} autoPlay={loop} muted={loop} loop={loop} playsInline preload="metadata" />
          ) : (
            <p className={styles.placeholder} style={{ position: "absolute", inset: 0 }}>
              Paste a YouTube, Vimeo or Instagram link, or upload a clip.
            </p>
          )}
        </div>
        {filled(caption) ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      </Frame>
    );
  },
};

// ---------------------------------------------------------------- Swatches

type SwatchesProps = L & { picks: { pick: string }[]; size: "s" | "m" | "l"; labels: "none" | "name" | "full"; link: boolean };

export const Swatches = {
  label: "Swatches",
  description: "Pinked swatches of chosen colourways, glued on like a shade card.",
  keywords: ["colourways", "fabric", "cloth", "chips", "colors"],
  fields: {
    picks: f.array("Swatches", { pick: f.colourway("Colourway") }, { summary: (it) => it.pick?.split("/").slice(1).join(" · ") || "Swatch", add: { pick: "" } }),
    size: f.choice("Size", [
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
    ]),
    labels: f.choice("Labels", [
      { label: "None", value: "none" },
      { label: "Name", value: "name" },
      { label: "Name and shade", value: "full" },
    ]),
    link: f.toggle("Open the collection when pressed"),
    layout: f.layout(),
  },
  defaultProps: { picks: [], size: "m", labels: "full", link: true, layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ picks, size, labels, link, layout, puck }: SwatchesProps & PuckBits) => {
    const items = picksToSwatches(puck.metadata.collections, picks);
    if (!items.length) return <Frame layout={layout}><p className={styles.placeholder}>Choose colourways from the collections in the settings panel.</p></Frame>;
    return (
      <Frame layout={layout}>
        <ul className={styles.swatches} data-size={size}>
          {items.map((it, i) => {
            const body = (
              <>
                <Swatch chip={it.chip} index={i} sizes={size === "l" ? "240px" : size === "s" ? "96px" : "160px"} alt={labels === "none" ? `${it.design} in ${it.colourway}` : ""} />
                {labels !== "none" ? (
                  <span className={styles.swatchText}>
                    <span className="t-label">{it.design}</span>
                    <span className={styles.swatchName}>{it.colourway}</span>
                    {labels === "full" ? <span className="t-shade">Ground {it.chip.shade}</span> : null}
                  </span>
                ) : null}
              </>
            );
            return (
              <li key={`${it.id}-${i}`}>
                {link ? (
                  <SmartLink href={`${collectionPath(puck.metadata, it.collectionSlug)}#${it.designSlug}`} className={styles.swatchItem}>
                    {body}
                  </SmartLink>
                ) : (
                  <span className={styles.swatchItem}>{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Frame>
    );
  },
};

// ------------------------------------------------------------ SwatchViewer

type ViewerProps = L & { picks: { pick: string }[]; title: TextValue; text: TextValue; windowSide: "right" | "left"; labels: "design" | "colourway" };

export const SwatchViewer = {
  label: "Swatch window",
  description: "Swatches beside a window: pressing one shows that cloth hanging in a room.",
  keywords: ["picker", "colourways", "room", "window", "interactive"],
  fields: {
    title: f.text("Heading", { inline: true }),
    text: f.textarea("Text", { inline: true }),
    picks: f.array("Swatches", { pick: f.colourway("Colourway") }, { summary: (it) => it.pick?.split("/").slice(1).join(" · ") || "Swatch", add: { pick: "" } }),
    labels: f.choice("Label each swatch with", [
      { label: "Design", value: "design" },
      { label: "Colourway", value: "colourway" },
    ]),
    windowSide: f.choice("Window", [
      { label: "Right", value: "right" },
      { label: "Left", value: "left" },
    ]),
    layout: f.layout(),
  },
  defaultProps: { title: "Kadamba", text: "", picks: [], labels: "colourway", windowSide: "right", layout: { width: "wide", space: "m", show: "all", motion: "none" } },
  render: ({ picks, title, text, windowSide, labels, layout, puck }: ViewerProps & PuckBits) => {
    const items = picksToSwatches(puck.metadata.collections, picks);
    if (!items.length) return <Frame layout={layout}><p className={styles.placeholder}>Choose colourways for this window in the settings panel.</p></Frame>;
    return (
      <Frame layout={layout}>
        <div className={rowStyles.row} style={{ borderTop: 0, contentVisibility: "visible", direction: windowSide === "left" ? "rtl" : undefined }} data-single={items.length > 1 ? undefined : ""}>
          <SwatchPicker items={items} label={typeof title === "string" && title ? `${title} swatches` : "Swatches"}>
            <div className={rowStyles.text} style={{ direction: "ltr" }}>
              {filled(title) ? <h2 className="t-title">{display(title)}</h2> : null}
              {filled(text) ? <p className={`t-body ${rowStyles.story}`}>{text}</p> : null}
              <SwatchChips className={rowStyles.chips} sizes="(max-width: 860px) 26vw, 8vw" labels={labels} />
              <SwatchShopLink shopName={puck.metadata.site.shop.name} />
            </div>
            <SwatchWindow className={rowStyles.window} sizes="(max-width: 860px) 92vw, 40vw" />
          </SwatchPicker>
        </div>
      </Frame>
    );
  },
};

// ----------------------------------------------------------------- ThenNow

type FigureSide = { kind: "photo" | "design"; photo: Photo | null; design: string; caption: string };
type ThenNowProps = L & { title: TextValue; text: TextValue; link: LinkValue; linkLabel: TextValue; then: FigureSide; now: FigureSide };

function Side({ side, className, meta, index }: { side: FigureSide; className: string; meta: PuckBits["puck"]["metadata"]; index: number }) {
  const swatches: SwatchItem[] = side.kind === "design" ? designSwatches(meta.collections, side.design) : [];
  return (
    <figure className={className}>
      {side.kind === "design" ? (
        <ul className={practice.nowChips} aria-label={side.caption || "Colourways"}>
          {swatches.map((s, i) => (
            <li key={s.id}>
              <Swatch chip={s.chip} index={i + index} sizes="(max-width: 760px) 30vw, 10vw" alt={`${s.design} in ${s.colourway}`} />
            </li>
          ))}
        </ul>
      ) : (
        <span className={practice.frame} style={{ backgroundColor: side.photo?.color }}>
          <Pic photo={side.photo} sizes="(max-width: 760px) 92vw, 30vw" />
        </span>
      )}
      {side.caption ? <figcaption className="t-shade">{side.caption}</figcaption> : null}
    </figure>
  );
}

const sideFields = {
  kind: f.choice("Show", [
    { label: "A photo", value: "photo" },
    { label: "A design's swatches", value: "design" },
  ]),
  photo: f.photo("Photo"),
  design: f.design("Design"),
  caption: f.text("Caption"),
};

export const ThenNow = {
  label: "Then and now",
  description: "A card pairing an early study with what it became, like Kadamb and Kadamba.",
  keywords: ["before after", "comparison", "story", "thread"],
  fields: {
    title: f.text("Heading", { inline: true }),
    text: f.textarea("Story", { inline: true }),
    linkLabel: f.text("Link words", { inline: true }),
    link: f.link("Link goes to"),
    then: f.object("First (then)", sideFields),
    now: f.object("Second (now)", sideFields),
    layout: f.layout(),
  },
  defaultProps: {
    title: "A flower that came back",
    text: "",
    linkLabel: "",
    link: { href: "" },
    then: { kind: "photo", photo: null, design: "", caption: "" },
    now: { kind: "design", photo: null, design: "", caption: "" },
    layout: { width: "wide", space: "xl", show: "all", motion: "none" },
  },
  render: ({ title, text, link, linkLabel, then, now, layout, puck }: ThenNowProps & PuckBits) => (
    <Frame layout={layout} as="section">
      <div className={`card ${practice.thread}`} style={{ marginTop: 0 } as CSSProperties}>
        <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
        <div className={practice.threadText}>
          {filled(title) ? <h2 className="t-title">{display(title)}</h2> : null}
          {filled(text) ? <p className="t-body">{text}</p> : null}
          {link?.href && filled(linkLabel) ? (
            <SmartLink href={link.href} newTab={link.newTab} className={`t-label ${practice.threadLink}`}>
              {linkLabel}
              <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
            </SmartLink>
          ) : null}
        </div>
        <Side side={then} className={practice.then} meta={puck.metadata} index={0} />
        <Side side={now} className={practice.now} meta={puck.metadata} index={2} />
      </div>
    </Frame>
  ),
};

export const mediaBlocks = { Image: ImageBlock, Gallery, Video, Swatches, SwatchViewer, ThenNow };
