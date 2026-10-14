// Framing for Shruchi's Behance studies. Body text on each study page is her own
// writing from Behance; only the hook and credits below are written for this site,
// and every credit restates a fact from her project text.
export type StudyMeta = {
  slug: string;
  title: string;
  sources: string[];
  hook: string;
  credits: { label: string; value: string }[];
  cover: { source: string; index: number };
  featured: boolean;
};

export const studies: StudyMeta[] = [
  {
    slug: "sura",
    title: "Sura",
    sources: ["sura"],
    hook: "Ajrak motifs drawn from African masks, with the faces hidden inside the pattern.",
    credits: [
      { label: "Craft", value: "Ajrak block printing" },
      { label: "Inspiration", value: "African masks" },
      { label: "Made", value: "Motifs, blocks, print samples, products, identity" },
    ],
    cover: { source: "sura", index: 7 },
    featured: true,
  },
  {
    slug: "chitrakatha-bag",
    title: "Chitrakatha bag",
    sources: ["chitrakatha-bag"],
    hook: "A festival goodie bag folded from one origami pattern, printed with an Andhra folk tale as a comic.",
    credits: [
      { label: "For", value: "Chitrakatha '19, NID Andhra Pradesh" },
      { label: "Crafts", value: "Kalamkari block printing, Tholu Bommalata" },
      { label: "Materials", value: "Muslin, wooden blocks, indigo" },
      { label: "Cost", value: "Rs. 135 a bag, four stitch lines" },
    ],
    cover: { source: "chitrakatha-bag", index: 15 },
    featured: true,
  },
  {
    slug: "tangaliya",
    title: "Tangaliya",
    sources: ["tangaliya"],
    hook: "A woven bed collection made with the Tangaliya weavers of Gujarat.",
    credits: [
      { label: "Client", value: "This and That, Ahmedabad" },
      { label: "Craft", value: "Tangaliya weaving, Gujarat" },
      { label: "Brief", value: "Bedding for the Bastar furniture collection" },
    ],
    cover: { source: "tangaliya", index: 4 },
    featured: true,
  },
  {
    slug: "gangireddu",
    title: "Gangireddu",
    sources: ["gangireddu"],
    hook: "A festive repeat built from the decorated oxen of an Andhra harvest festival.",
    credits: [
      { label: "Course", value: "Advanced print design" },
      { label: "Inspiration", value: "Gangireddu, Andhra Pradesh" },
      { label: "Made", value: "Textures, a repeat, colourways, printed garments" },
    ],
    cover: { source: "gangireddu", index: 3 },
    featured: true,
  },
  {
    slug: "ikat",
    title: "Ikat weaving",
    sources: ["ikkat-weaving"],
    hook: "Upholstery ikats from Odissi dance: the headgear, the waistband and the mudra.",
    credits: [
      { label: "Workshop", value: "Ikat, with traditional ikat experts" },
      { label: "Inspiration", value: "Odissi dance, Odisha" },
      { label: "Use", value: "Upholstery fabric" },
    ],
    cover: { source: "ikkat-weaving", index: 7 },
    featured: true,
  },
  {
    slug: "kapaas",
    title: "Kapaas",
    sources: ["kapaas"],
    hook: "Surfaces from a walk through a cotton field, where soft bolls break out of hard pods.",
    credits: [
      { label: "Course", value: "Fabric construction" },
      { label: "Technique", value: "Slashing" },
      { label: "Inspiration", value: "A cotton farm" },
    ],
    cover: { source: "kapaas", index: 4 },
    featured: true,
  },
  {
    slug: "kaantha",
    title: "Kaantha",
    sources: ["kaantha"],
    hook: "Six cushion designs in Kantha running stitch on khadi.",
    credits: [
      { label: "Client", value: "This and That, Ahmedabad" },
      { label: "Craft", value: "Kantha embroidery by Kutchi women, Gujarat" },
      { label: "Cloth", value: "Khadi" },
    ],
    cover: { source: "kaantha", index: 0 },
    featured: false,
  },
  {
    slug: "kalamkari",
    title: "Kalamkari apparel",
    sources: ["kalamkari-apparel"],
    hook: "Contemporary clothing cut from traditional Kalamkari cloth.",
    credits: [
      { label: "Course", value: "Garment construction" },
      { label: "Cloth", value: "Kalamkari" },
    ],
    cover: { source: "kalamkari-apparel", index: 3 },
    featured: false,
  },
  {
    slug: "woven-story",
    title: "Woven story",
    sources: ["woven-story"],
    hook: "Handwoven stripes and checks, on the loom and out in the sun.",
    credits: [{ label: "Technique", value: "Handloom weaving" }],
    cover: { source: "woven-story", index: 1 },
    featured: false,
  },
  {
    slug: "small-pieces",
    title: "Canary, Rust, Mustard",
    sources: ["canary", "rust", "mustard"],
    hook: "A scarf, a blouse and a bolster, made from handloom and finished by hand.",
    credits: [
      { label: "Cloth", value: "Handloom" },
      { label: "Details", value: "Crochet lace, Gundi buttons, appliqué, mother-of-pearl" },
    ],
    cover: { source: "canary", index: 0 },
    featured: false,
  },
];

// Behance stores some headings and paragraphs in one text module with no space
// between them. These restore the break exactly where she wrote it.
export const textSplits: Record<string, [heading: string, body?: string]> = {
  "Set of Designs": ["Set of designs"],
  "Set of Colors": ["Set of colours"],
  "KADAMB- Concept I:": ["Kadamb"],
  "KAMARBANDH - Concept II": ["Kamarbandh"],
  "MUDRA - Concept III": ["Mudra"],
  "Brand Identity": ["Brand identity"],
  "Environment friendly": ["Environment friendly"],
  "Points collected from the initial research:": ["Points from the initial research"],
};
