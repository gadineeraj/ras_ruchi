// Section designs for "+ Add section": ready-made arrangements of blocks, each
// filled with placeholder words so she sees what goes where. Every block gets
// its full default settings, then the preset's own.
import { blocks } from "@/blocks/config";

type Props = Record<string, unknown>;
export type PresetBlock = { type: string; props: Props };
export type Sketch = { kind: "bars" | "photo" | "band" | "swatches" | "quote" | "button" | "cols" | "grid" | "board" | "word"; span?: number; n?: number; tone?: "dark" | "accent" }[];
export type Preset = { id: string; title: string; description: string; group: string; tree: PresetBlock; sketch: Sketch[] };

function b(type: string, props: Props = {}): PresetBlock {
  const defaults = ((blocks as Record<string, { defaultProps?: Props }>)[type]?.defaultProps ?? {}) as Props;
  const layout = { ...((defaults.layout as Props) ?? {}), ...((props.layout as Props) ?? {}) };
  return { type, props: { ...defaults, ...props, ...(defaults.layout || props.layout ? { layout } : {}), id: "" } };
}

const inSlot = { width: "wide", space: "none", show: "all", motion: "none" };
const slotted = (type: string, props: Props = {}) => b(type, { ...props, layout: { ...inSlot, ...((props.layout as Props) ?? {}) } });

export const presets: Preset[] = [
  // ------------------------------------------------------------------ words
  {
    id: "heading-text",
    group: "Words",
    title: "Heading and text",
    description: "A section title with an introduction and room for more.",
    tree: b("Section", { title: "A new section", lede: "One or two sentences that introduce it.", content: [slotted("Text", { text: "<p>Write more here: the story behind the work, the place, the people who made it.</p>" })] }),
    sketch: [[{ kind: "bars", n: 1, tone: "dark" }], [{ kind: "bars", n: 3 }]],
  },
  {
    id: "two-columns-text",
    group: "Words",
    title: "Two columns of text",
    description: "Side-by-side paragraphs, stacked on phones.",
    tree: b("Columns", {
      split: "1:1",
      one: [slotted("Heading", { text: "The idea", size: "title", level: "h3" }), slotted("Text", { text: "<p>What she set out to do.</p>", layout: { ...inSlot, space: "s" } })],
      two: [slotted("Heading", { text: "The making", size: "title", level: "h3" }), slotted("Text", { text: "<p>How it was made and with whom.</p>", layout: { ...inSlot, space: "s" } })],
    }),
    sketch: [[{ kind: "cols", n: 2 }]],
  },
  {
    id: "quote",
    group: "Words",
    title: "Quote",
    description: "One sentence in her words, in Bodoni italic.",
    tree: b("Quote", { quote: "The fragile cotton bolls push themselves out of their protecting layers to come out and bloom.", from: "Kapaas" }),
    sketch: [[{ kind: "quote" }]],
  },
  {
    id: "quotes-row",
    group: "Words",
    title: "Three quotes",
    description: "A row of her sentences with where they come from.",
    tree: b("Quotes", {
      title: "In her words",
      quotes: [
        { quote: "A sentence from a project.", from: "Project name", link: { href: "" } },
        { quote: "Another sentence.", from: "Project name", link: { href: "" } },
        { quote: "A third.", from: "Project name", link: { href: "" } },
      ],
    }),
    sketch: [[{ kind: "bars", n: 1, tone: "dark" }], [{ kind: "quote" }, { kind: "quote" }, { kind: "quote" }]],
  },
  {
    id: "facts",
    group: "Words",
    title: "Facts list",
    description: "Label and detail rows: craft, client, materials.",
    tree: b("Facts", { rows: [{ label: "Craft", value: "Block printing" }, { label: "With", value: "Artisans in Bagru" }, { label: "Year", value: "2026" }] }),
    sketch: [[{ kind: "bars", n: 3 }]],
  },
  {
    id: "call-to-action",
    group: "Words",
    title: "Invitation",
    description: "A centred line and a button: see the collections, write to her.",
    tree: b("Section", {
      title: "See every design",
      lede: "Each card holds a collection in all its colourways.",
      align: "center",
      content: [slotted("Button", { label: "Open the collections", link: { href: "/collections" }, align: "center" })],
    }),
    sketch: [[{ kind: "bars", n: 1, tone: "dark" }], [{ kind: "button" }]],
  },

  // ----------------------------------------------------------------- photos
  {
    id: "photo-text",
    group: "Photos with words",
    title: "Photo beside text",
    description: "A photo on the left, words on the right.",
    tree: b("Columns", {
      split: "7:5",
      valign: "center",
      one: [slotted("Image", { ratio: "4:5", frame: "card" })],
      two: [slotted("Heading", { text: "A heading", size: "title", level: "h3" }), slotted("Text", { text: "<p>Tell the story of this photograph.</p>", layout: { ...inSlot, space: "s" } })],
    }),
    sketch: [[{ kind: "photo", span: 7 }, { kind: "bars", n: 3, span: 5 }]],
  },
  {
    id: "text-photo",
    group: "Photos with words",
    title: "Text beside photo",
    description: "Words on the left, a photo on the right; the photo comes first on phones.",
    tree: b("Columns", {
      split: "5:7",
      valign: "center",
      mobile: "reverse",
      one: [slotted("Heading", { text: "A heading", size: "title", level: "h3" }), slotted("Text", { text: "<p>Tell the story of this photograph.</p>", layout: { ...inSlot, space: "s" } })],
      two: [slotted("Image", { ratio: "4:5", frame: "card" })],
    }),
    sketch: [[{ kind: "bars", n: 3, span: 5 }, { kind: "photo", span: 7 }]],
  },
  {
    id: "big-photo",
    group: "Photos",
    title: "Large photo",
    description: "One photograph across the page, with a caption.",
    tree: b("Image", { ratio: "16:9", size: "fill", frame: "card", caption: "A caption for the photo" }),
    sketch: [[{ kind: "photo" }], [{ kind: "bars", n: 1 }]],
  },
  {
    id: "full-bleed",
    group: "Photos",
    title: "Edge-to-edge photo",
    description: "A photograph that runs to the edges of the screen.",
    tree: b("Image", { ratio: "21:9", size: "fill", frame: "plain", layout: { width: "full", space: "l" } }),
    sketch: [[{ kind: "photo", tone: "dark" }]],
  },
  {
    id: "gallery-grid",
    group: "Photos",
    title: "Photo grid",
    description: "Photos in even rows. Visitors can open any of them full screen.",
    tree: b("Gallery", { arrangement: "grid", columns: 3, ratio: "4:5" }),
    sketch: [[{ kind: "grid", n: 6 }]],
  },
  {
    id: "masonry",
    group: "Photos",
    title: "Photo wall",
    description: "Photos at their own shapes, stacked like a pinboard.",
    tree: b("Gallery", { arrangement: "masonry", columns: 3, ratio: "auto" }),
    sketch: [[{ kind: "grid", n: 5 }]],
  },
  {
    id: "strip",
    group: "Photos",
    title: "Sideways strip",
    description: "A row of photos visitors swipe or scroll through.",
    tree: b("Gallery", { arrangement: "strip", ratio: "4:5" }),
    sketch: [[{ kind: "photo" }, { kind: "photo" }, { kind: "photo" }]],
  },
  {
    id: "process",
    group: "Photos with words",
    title: "Process steps",
    description: "Look, Draw, Make: a project followed step by step.",
    tree: b("ProcessSteps", {
      steps: [
        { verb: "Look", photo: null, text: "What she looked at." },
        { verb: "Draw", photo: null, text: "How the motif was drawn." },
        { verb: "Make", photo: null, text: "What it became." },
      ],
      moreLabel: "",
      more: { href: "" },
    }),
    sketch: [[{ kind: "photo" }, { kind: "photo" }, { kind: "photo" }], [{ kind: "word" }, { kind: "word" }, { kind: "word" }]],
  },
  {
    id: "big-word",
    group: "Photos with words",
    title: "Big word with examples",
    description: "One large word with a line about it and three linked photos.",
    tree: b("PracticeWay", {
      verb: "Weave",
      summary: "A line about this way of working.",
      examples: [
        { photo: null, text: "An example", link: { href: "" } },
        { photo: null, text: "Another", link: { href: "" } },
        { photo: null, text: "A third", link: { href: "" } },
      ],
    }),
    sketch: [[{ kind: "word", span: 4 }, { kind: "bars", n: 2, span: 8 }], [{ kind: "photo" }, { kind: "photo" }, { kind: "photo" }]],
  },
  {
    id: "video",
    group: "Photos",
    title: "Video",
    description: "A film from YouTube, Vimeo or Instagram, or a clip she uploads.",
    tree: b("Video"),
    sketch: [[{ kind: "photo", tone: "dark" }]],
  },

  // -------------------------------------------------------------- textiles
  {
    id: "swatch-row",
    group: "Cloth and colour",
    title: "Swatch row",
    description: "Pinked swatches from her collections with their names and shades.",
    tree: b("Swatches", { picks: [{ pick: "ratna/kadamba/crimson-red" }, { pick: "ratna/tara/indigo" }, { pick: "rasaa/kinari/brick-red" }, { pick: "entwine/glen/mist-blue" }] }),
    sketch: [[{ kind: "swatches", n: 5 }]],
  },
  {
    id: "swatch-window",
    group: "Cloth and colour",
    title: "Swatch window",
    description: "Swatches beside a window showing the cloth in a room.",
    tree: b("SwatchViewer", { title: "Kadamba", text: "Printed on cotton, in three colourways.", picks: [{ pick: "ratna/kadamba/crimson-red" }] }),
    sketch: [[{ kind: "swatches", n: 3, span: 7 }, { kind: "photo", span: 5 }]],
  },
  {
    id: "then-now",
    group: "Cloth and colour",
    title: "Then and now",
    description: "An early study beside the design it became.",
    tree: b("ThenNow", { text: "The story of how an idea came back years later." }),
    sketch: [[{ kind: "bars", n: 3, span: 5 }, { kind: "photo", span: 3 }, { kind: "swatches", n: 3, span: 4 }]],
  },
  {
    id: "mood-board",
    group: "Cloth and colour",
    title: "Mood board",
    description: "Photos, words and swatches placed freely, overlapping like a pinboard.",
    tree: b("FreeCanvas"),
    sketch: [[{ kind: "board" }]],
  },

  // ------------------------------------------------------------- highlights
  {
    id: "highlight-card",
    group: "Highlights",
    title: "Highlight card",
    description: "Words on card stock headed by a colour band, like a collection card.",
    tree: b("Card", {
      band: "#6a2222",
      bandTitle: "A highlight",
      bandNote: "2026",
      content: [slotted("Text", { text: "<p>Something worth calling out: an exhibition, a commission, a new collaboration.</p>", style: "lead" }), slotted("Button", { label: "Find out more", link: { href: "" }, style: "text", layout: { ...inSlot, space: "s" } })],
    }),
    sketch: [[{ kind: "band", tone: "accent" }], [{ kind: "bars", n: 2 }]],
  },
  {
    id: "note-card",
    group: "Highlights",
    title: "Note on card",
    description: "A plain sheet of card stock with a punched hole.",
    tree: b("Card", { band: "none", content: [slotted("Heading", { text: "A note", size: "title", level: "h3" }), slotted("Text", { text: "<p>A few lines set apart from the rest of the page.</p>", layout: { ...inSlot, space: "s" } })] }),
    sketch: [[{ kind: "bars", n: 1, tone: "dark" }], [{ kind: "bars", n: 2 }]],
  },
  {
    id: "coloured-section",
    group: "Highlights",
    title: "Coloured section",
    description: "A section on one of her colours, for a change of pace.",
    tree: b("Section", { title: "A coloured section", lede: "Words set on a band of colour.", background: "#33503f", content: [] }),
    sketch: [[{ kind: "band", tone: "dark" }]],
  },

  // -------------------------------------------------------------- her work
  {
    id: "collections",
    group: "Her work",
    title: "Collection cards",
    description: "All her collections as a stack of cards.",
    tree: b("Section", { title: "Collections", lede: "", content: [slotted("CollectionCards")] }),
    sketch: [[{ kind: "band", tone: "accent" }], [{ kind: "swatches", n: 5 }]],
  },
  {
    id: "studies",
    group: "Her work",
    title: "Study sheets",
    description: "Her studies as development sheets.",
    tree: b("Section", { title: "Studies", lede: "", content: [slotted("StudySheets")] }),
    sketch: [[{ kind: "photo", span: 6 }, { kind: "photo", span: 3 }, { kind: "photo", span: 3 }]],
  },
  {
    id: "shade-board",
    group: "Her work",
    title: "Shade board",
    description: "Every colourway on one mounted board.",
    tree: b("Section", { title: "Every swatch", lede: "{colourways} colourways of {designs} designs.", content: [slotted("ShadeBoard")] }),
    sketch: [[{ kind: "swatches", n: 8 }], [{ kind: "swatches", n: 8 }]],
  },
];

export const presetGroups = [...new Set(presets.map((p) => p.group))];
