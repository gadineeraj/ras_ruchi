// Hand-written framing for each Yellow Dwelling collection. Each band colour is a
// deepened shade from the collection's own cloth: Rasaa's Kolam green, Entwine's
// Glen mist blue, Ratna's Kadamba crimson, Pause's Sienna mustard, Pergola indigo.
export type CollectionMeta = {
  band: string;
  onBand: "light" | "dark";
  intro: string;
  line?: string;
};

export const collectionMeta: Record<string, CollectionMeta> = {
  rasaa: {
    band: "#33503f",
    onBand: "light",
    intro:
      "The festive ensemble for 2026. Plain cotton and linen grounds carry their detail at the edges: woven zari borders drawn from temple borders, embroidered floral and geo-floral trims, and small printed buttis.",
  },
  entwine: {
    band: "#56698a",
    onBand: "light",
    intro:
      "Summer 2026. Soft solids finished with embroidered trims in Elba and Glen, alongside light florals and sprigs on cotton: Roselle, Flutter, Peony and Pomera.",
  },
  ratna: {
    band: "#6a2222",
    onBand: "light",
    line: "Rooted, royal, reimagined.",
    intro:
      "The festive collection for 2025. Ikat geometry in royal blue and brick red, crimson and jade grounds with printed floral borders, and repeats named for places and things: Durbar, Palace Pillars, Mulbagal, Meenakshi, Thinnai.",
  },
  pause: {
    band: "#d9a64a",
    onBand: "dark",
    intro:
      "Summer 2025. Sheers and printed cottons in sage, mist blue, mustard and rose: small florals, stripes and geometric repeats.",
  },
  archive: {
    band: "#2c3d63",
    onBand: "light",
    intro:
      "Designs from the seasons before Ratna, 2022 to 2024, still on the shelf: Lotus Pond and Sacred Waters, Pergola, Gingko, Spice Route, Climbing Roses and more.",
  },
};
