// The shapes of everything Shruchi can edit. All of it lives as JSON in
// content/: the Studio writes those files, the site reads them.

/** A processed photograph: a sized WebP with a blur placeholder and its main colour. */
export type Img = {
  src: string;
  width: number;
  height: number;
  blur: string;
  color: string;
  animated?: boolean;
};

/** A photograph placed on a page: alt text and the point that must stay in frame when cropped. */
export type Photo = Img & {
  alt?: string;
  /** Focal point in percent, 0-100 on each axis. */
  focus?: { x: number; y: number };
};

/** One entry in the photo library. */
export type MediaItem = Img & {
  name: string;
  alt?: string;
  folder: string;
  added: string;
};

export type Shade = { id: string; name: string; hex: string };

export type NavLink = { label: string; href: string };

export type SiteSettings = {
  name: string;
  nameDevanagari: string;
  person: string;
  role: string;
  description: string;
  email: string;
  /** Where her designs are sold; swatch links say "Brick Red at …". */
  shop: { name: string; url: string };
  nav: NavLink[];
  links: { label: string; href: string }[];
  footer: { heading: string; credit: string; copyright: string };
  shades: Shade[];
  shareImage?: Photo | null;
  /** Page ids in the order the Studio's Pages panel shows them. */
  pageOrder: string[];
};

// -------------------------------------------------------------- collections

export type Colourway = {
  id: string;
  name: string;
  /** The shop page for this colourway. */
  url: string;
  /** Product type of the room photograph, e.g. "Blind". */
  seenAs: string;
  /** Product type the close-up was taken from. */
  swatchFrom: string;
  swatch: Img;
  scene: Img | null;
  chip: Img & { shade: string };
};

export type Design = {
  slug: string;
  name: string;
  technique: string;
  story: string;
  colourways: Colourway[];
};

export type Collection = {
  slug: string;
  name: string;
  season: string;
  /** The printed band colour, a hex value. */
  band: string;
  line: string;
  intro: string;
  designs: Design[];
};

// -------------------------------------------------------------------- pages

export type PageKind = "page" | "collection" | "study";

export type PageRoot = {
  /** The page's name, used in the browser tab and in the Studio. */
  title: string;
  /** Web address, "/" for home or "/practice" style paths. */
  path: string;
  kind: PageKind;
  description: string;
  /** Collection pages: which collection the page shows. */
  collection?: string;
  /** Kept out of the published site until switched off. */
  draft?: boolean;
  shareImage?: Photo | null;
};

export type BlockData = { type: string; props: Record<string, any> & { id: string } };

export type PageData = { root: { props: PageRoot }; content: BlockData[]; zones?: Record<string, BlockData[]> };

export type Page = { id: string; data: PageData };

/** What the studies index needs from each study page. */
export type StudySummary = {
  id: string;
  path: string;
  title: string;
  hook: string;
  credits: { label: string; value: string }[];
  cover: Photo | null;
};

/** Everything a block may read besides its own props. */
export type SiteMeta = {
  site: SiteSettings;
  collections: Collection[];
  studies: StudySummary[];
  pages: { id: string; title: string; path: string; kind: PageKind; draft?: boolean }[];
  /** The page being rendered. */
  page: { id: string; path: string; kind: PageKind; collection?: string };
  editing?: boolean;
};
