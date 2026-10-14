---
name: ras.ruchi
description: The textile work of Shruchi Jaiswal, shown the way a mill shows cloth.
colors:
  board: "#d6d6d1"
  board-deep: "#c9c9c3"
  card: "#f4f4f1"
  ink: "#161615"
  ink-2: "#4d4d48"
  hair: "rgb(22 22 21 / 0.16)"
  hair-strong: "rgb(22 22 21 / 0.42)"
  band-rasaa: "#33503f"
  band-entwine: "#56698a"
  band-ratna: "#6a2222"
  band-pause: "#d9a64a"
  band-archive: "#2c3d63"
  on-band-light: "#f7f3ee"
  on-band-dark: "#1b1a14"
  board-night: "#121311"
  board-deep-night: "#0d0e0c"
  card-night: "#1c1d1a"
  ink-night: "#ebeae4"
  ink-2-night: "#a8a79f"
typography:
  wordmark:
    fontFamily: "Rozha One, Georgia, serif"
    fontSize: "clamp(64px, 11.4vw, 184px)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Rozha One, Georgia, serif"
    fontSize: "clamp(38px, 5.6vw, 84px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Rozha One, Georgia, serif"
    fontSize: "clamp(25px, 2.5vw, 36px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  tagline:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "clamp(20px, 1.8vw, 26px)"
    fontWeight: 500
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Jost, Avenir Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.55vw, 23px)"
    fontWeight: 400
    lineHeight: 1.42
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Jost, Avenir Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.12em"
  shade:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\" 1"
  devanagari:
    fontFamily: "Rozha One, serif"
    fontWeight: 400
rounded:
  none: "0px"
  hole: "50%"
spacing:
  gutter: "clamp(12px, 2.4vw, 32px)"
  pad: "clamp(18px, 3vw, 44px)"
  max: "1520px"
  section: "clamp(80px, 12vw, 168px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.none}"
    padding: "14px 20px 14px 22px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.none}"
    padding: "{spacing.pad}"
  card-hole:
    backgroundColor: "{colors.board}"
    rounded: "{rounded.hole}"
    size: "15px"
  collection-band-ratna:
    backgroundColor: "{colors.band-ratna}"
    textColor: "{colors.on-band-light}"
    rounded: "{rounded.none}"
  collection-band-pause:
    backgroundColor: "{colors.band-pause}"
    textColor: "{colors.on-band-dark}"
    rounded: "{rounded.none}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "12px 0"
  nav-link-active:
    textColor: "{colors.ink}"
  keyword-tag:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 12px 6px"
---

# Design System: ras.ruchi

## Overview

**Creative North Star: "The Mill Shade Card"**

Every surface is a sheet of white card stock lying on grey mill board, punched with a ring hole, with cut cloth glued to it and its particulars printed beside it in tracked caps. The work is the colour; the interface is board, card, ink and print. A collection announces itself with one printed colour band across the top of its card, the way a mill heads a range. Swatches are square, pinked along every edge, tilted a fraction of a degree as if placed by hand, and they lift off the card when handled.

Density is a catalogue's: many small swatches in strict grids, generous card margins, long reading lines held to about 62 characters. Type does three jobs and keeps them apart: Rozha One's high-contrast fat face for card headers and the wordmark, in Latin and Devanagari alike, the way a textile label or fashion masthead is set; Jost for reading; and Jost's small tracked caps for everything a mill would print (labels, seasons, counts, measured hex shade codes). Corners are square everywhere; the only circles are punched holes and colour dots.

Motion is physical and sparse: swatches are dealt onto the card once on load, lift and tilt under the hand, and a collection's band morphs from its card into its page header. Under reduced motion everything is static.

**Key Characteristics:**
- Grey mill board ground, white card stock above it, charcoal board and dark stock at night.
- Square, pinked-edge cloth swatches with a soft two-layer drop shadow and a slight per-swatch tilt.
- One printed colour band per collection, drawn from that collection's own cloth.
- Rozha One for headers, the wordmark and रसरुचि; Bodoni Moda italic for taglines and quotes only; Jost for reading and for printed caps.
- Zero radius; a punched ring hole on every card.

## Colors

A near-neutral, faintly warm grey system that recedes behind the cloth, plus five collection bands that each belong to exactly one collection.

### Primary
- **Ink Black** (`ink`): All text, the solid call-to-action fill, focus outlines. Never a background for whole sections.

### Secondary
- **Collection Bands**: **Kolam Green** (`band-rasaa`), **Glen Mist Blue** (`band-entwine`), **Kadamba Oxblood** (`band-ratna`), **Sienna Mustard** (`band-pause`), **Pergola Indigo** (`band-archive`). Each is a deepened shade sampled from that collection's own cloth. A band fills the head of that collection's card and page, a 12px strip beside its row in the swatch mosaic, and the dot beside its name in the pager. Text on bands is warm off-white (`on-band-light`), except on mustard, which takes near-black (`on-band-dark`).
- **Kadamba Oxblood** doubles as the text-selection fill and caret colour, the system's only interactive use of a band.

### Neutral
- **Mill Board Grey** (`board`): Page ground, sticky header ground, and the colour seen through every punched hole.
- **Deep Board** (`board-deep`): The empty room window behind a loading or crossfading photograph.
- **Card Stock** (`card`): Every card surface, keyword tags.
- **Press Grey** (`ink-2`): Secondary text, ledes, captions, shade codes, inactive navigation.
- **Hairline** (`hair`) and **Strong Rule** (`hair-strong`): Translucent ink rules: hairline between rows and groups, strong rule under a card's printed top rule and above credits and pagers.
- **Night set** (`board-night`, `board-deep-night`, `card-night`, `ink-night`, `ink-2-night`): The same roles under `prefers-color-scheme: dark`; bands are unchanged.

### Named Rules
**The One Band Rule.** A band colour belongs to one collection and appears only where that collection is named. Never use a band as a generic accent, button fill or section background.

**The Cloth Is The Colour Rule.** Interface colour stays in the board, card and ink greys; saturated colour on screen comes from photographs of cloth and from collection bands.

## Typography

**Display Font:** Rozha One (400 only, no italic; Latin and Devanagari subsets), falling back to Georgia, serif
**Italic Font:** Bodoni Moda italic (only the italic style is loaded), falling back to Didot, Georgia, serif; taglines and quotes only
**Body Font:** Jost (variable), falling back to Avenir Next, ui-sans-serif, system-ui
**Label Font:** Jost, in small tracked capitals
**Devanagari:** Rozha One (400), the same face as the display, for रसरुचि

**Character:** A fashion house's type. Rozha One (Indian Type Foundry) is a high-contrast fat face drawn for Devanagari and Latin together: heavy stems, fine hairlines, short capitals that sit close to the x-height, and a single weight. It carries everything headlined, the way a textile label or a fashion masthead does, and sets "ras.ruchi" and रसरुचि in one voice. Bodoni Moda's italic adds a hairline Didone hand to taglines and quotes. Jost reads quietly beneath and prints the particulars in small tracked capitals. `body` sets `font-synthesis: none`, so the browser never fakes a bold or an italic.

**Why these faces.** The user chose the "Fashion house" direction from six options: a high-contrast Didone like textile labels and fashion mastheads. Jost is a Futura-style geometric sans in the family of the Avenir used across The Yellow Dwelling's site and the Century Gothic of her Sura identity. Rozha One replaced Bodoni Moda as the display face so the Latin name and रसरुचि share one typeface; Bodoni Moda stays only as the italic.

### Hierarchy
- **Wordmark** (Rozha One 400, clamp(64px, 11.4vw, 184px), 0.84, -0.02em): "ras.ruchi" across the home card's header and collection page names; the hero sets it larger, up to 200px, on one line. The site header uses the same voice at 21px (400).
- **Display** (Rozha One 400, clamp(38px, 5.6vw, 84px), 0.98, -0.015em): Section headings, collection names on bands, the contact heading. Balanced wrapping.
- **Title** (Rozha One 400, clamp(25px, 2.5vw, 36px), 1.05, -0.01em): Design names in rows, study titles, study subheads.
- **Tagline** (Bodoni Moda italic 500, clamp(20px, 1.8vw, 26px), -0.01em): Collection taglines on cards and pages; the "In her words" quotes use the same italic at 400.
- **Lead** (Jost 400, clamp(19px, 1.55vw, 23px), 1.42): Section ledes and introductions, held to 40ch.
- **Body** (Jost 400, 17px, 1.6): Running text, held to 62ch with pretty wrapping.
- **Label** (Jost 500, 11.5px, 0.12em, uppercase): Printed particulars: navigation, seasons, technique lines, credit terms, link labels.
- **Shade** (Jost 400, 10.5px, 0.02em, uppercase, tabular numerals, Press Grey): Measured hex shade codes ("Ground #A34435"), counts, figure captions. Sized so a shade code fits a 95px swatch column; under a swatch it never wraps.
- **Devanagari** (Rozha One 400): The name रसरुचि only.

Smaller Rozha One settings, all at 400, carry process verbs, pager and next-study names, study sheet titles, caption and mosaic names. Collection pager names hold a 1.05 line height with balanced wrapping, so a two-line name such as "Earlier seasons" on phones stays tight, and both pager links align at the top. Bodoni Moda italic carries collection taglines ("Rooted, royal, reimagined.", 500) and the "In her words" quotes (400), and nothing else. The footer email is Jost 400, not the display face, so its "@" and descenders read plainly. Colourway names are Jost 500 at 14px.

### Named Rules
**The Printed Caps Rule.** Jost's small tracked caps are for printed particulars that sit beside or below what they describe: a design's technique, a swatch's shade, a collection's season. They never sit above a heading as an introductory line.

**The Centred Dot Rule.** The full stop in "ras.ruchi" sits centred, with equal space to the "s" and the "r". Its spacing is measured from rendered Rozha One at hero, phone and header sizes: 0.01em before and -0.01em after. Rozha One has no optical sizes, so one em-based value holds everywhere, the 21px header logo included. Re-measure if the face or size changes; never leave the default spacing.

**The Tucked Capital Rule.** Rozha One has no kerning, so a capital W or V leaves a visible gap before the lowercase letter after it ("W rite"). Every piece of display text (design names, collection names, study titles and headings, section titles, the footer heading) passes through the kern helper, which tucks the next letter in by -0.04em after W or V. Rozha's capitals are short, close to its x-height, so the tuck stays light to avoid collisions.

**The Measured Shade Rule.** A shade code is a hex value measured from the actual cloth photograph. Never print a code that was not measured.

## Layout

Content sits in a centred wrap of `min(100% - 2 × gutter, 1520px)`, with a fluid gutter (12-32px) and a fluid card padding (18-44px). Sections are separated by large fluid top padding (80-168px); section heads cap at 50rem.

The home hero is one card at nearly full viewport height on a 12-column grid: printed top rule across, wordmark and room window above, introduction and Devanagari name below, ten swatches across the foot. Below 860px it collapses to one column, the swatch row becomes a horizontally scrolling, snap-aligned strip (30% per swatch) placed before the room window so swatches stay in the first screen.

Collection cards stack as sticky sheets, each offset 16px further down than the last (12px on mobile), so the bands file like cards in a box. Design rows split 7:5 between text with swatches and a 4:5 room window, separated by hairlines. Studies are a four-column index of development sheets (featured items may span two), dropping to two columns at 1060px and one at 640px. Swatch grids use `auto-fill` minimums (96px in pickers, 48-66px in the mosaic).

The site header is sticky above 720px. On the home page it stays hidden while the hero's printed top rule carries the navigation, and slides in after the hero scrolls away.

## Elevation & Depth

Depth is physical and has exactly three layers: board, card stock lying on it, and cloth glued to the card. Card stock casts a low, diffuse shadow with a faint top highlight; cloth casts a tighter two-layer drop shadow that follows the pinked outline (a `filter: drop-shadow`, not a box shadow). Holes are cut through the card with an inset shadow on the cut edge. Night mode deepens every shadow rather than removing it.

### Shadow Vocabulary
- **Card Stock** (`box-shadow: 0 1px 0 rgb(255 255 255 / 0.5) inset, 0 1px 2px rgb(20 20 16 / 0.1), 0 12px 32px -18px rgb(20 20 16 / 0.35)`): Every card, study sheet and keyword tag at rest.
- **Cloth at Rest** (`filter: drop-shadow(0 1px 0.5px rgb(20 20 16 / 0.22)) drop-shadow(0 5px 9px rgb(20 20 16 / 0.12))`): Every swatch.
- **Cloth Lifted** (`filter: drop-shadow(0 2px 1px rgb(20 20 16 / 0.18)) drop-shadow(0 16px 22px rgb(20 20 16 / 0.22))`): A swatch under hover, focus or selection, and during the deal entrance.
- **Punched Hole** (`box-shadow: inset 0 2px 2.5px rgb(0 0 0 / 0.3), inset 0 -1px 0 rgb(255 255 255 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.06)`): The ring hole only.

### Named Rules
**The Three Layers Rule.** Board, card, cloth. Nothing else floats; there are no modals, glows or decorative elevations.

**The Cloth Lifts Rule.** Elevation changes are a response to handling: cloth lifts (up 6px, tilting a further 1.5deg; selected, up 12px, 2.5deg, scale 1.04) and study sheets rise 3-4px on hover.

## Shapes

Every rectangle is square-cornered (0px): cards, bands, windows, buttons, tags, photographs. The two circles in the system are the 15px punched ring hole, set 14-18px in from a card's top-left corner, and the colour dot beside a collection name in the pager. Swatches are square (1:1) and clipped by a pinked mask (`/pinked.svg`): a zigzag of 2.5% teeth along all four edges, scaled to the swatch. Each swatch carries a small deterministic tilt (between -1.05deg and +1.05deg) so a row reads as placed by hand. Rules are 1px hairlines; link underlines are 1-1.5px, thickening to 2px on hover.

## Components

### Buttons
Few and printed, not pill-shaped.
- **Shape:** Square (0px).
- **Primary:** Ink fill with card-stock text, Jost 15px at 620 weight, padding 14px 20px 14px 22px, trailing arrow icon. Used once per surface at most ("Open the collections").
- **Hover / Active:** The gap before the arrow widens (10px to 14px) over 240ms ease-out; pressing nudges it down 1px.
- **Text link button:** Printed-caps label with a 1.5px ink underline (`border-bottom`) and a trailing arrow whose gap widens on hover. Used for "shop" links and "more" links.

### Chips
- **Keyword tags:** Printed-caps labels on small card-stock rectangles with the card-stock shadow, padding 7px 12px 6px, square corners. Non-interactive.

### Cards / Containers
- **Corner Style:** Square (0px).
- **Background:** Card stock over board.
- **Shadow Strategy:** Card Stock shadow (see Elevation & Depth).
- **Border:** None; internal divisions are hairlines and strong rules.
- **Internal Padding:** The fluid card padding (18-44px); study sheets use a tighter 16-24px side margin around a mounted plate.
- **Ring hole:** Every card carries one punched hole at its top-left.

### Navigation
- **Style:** Printed-caps labels in Press Grey, 12px vertical padding, 14-34px apart.
- **Hover / Current:** Text goes to Ink and a 1.5px underline draws in from the left (scale 0 to 1 over 260ms ease-out).
- **Header:** Board-coloured bar with a hairline foot; Rozha One wordmark at 21px (400), its full stop centred, with the Devanagari name in the same face beside it. Below 560px the wordmark stacks above an evenly spaced link row.

### Swatch (signature)
A square, pinked, tilted piece of cloth photograph with the Cloth at Rest shadow. In a picker each swatch is a radio-like button labelled below with design (printed caps), colourway (Jost 14px, 500) and its measured shade code, which never wraps. Handling lifts it; choosing it lifts it highest and crossfades the room window (opacity 520ms, settle from scale 1.035 over 900ms). While one swatch is hovered, unselected siblings dim to 60%. On load, swatches are dealt onto the card once: falling from 26px above and -9deg, 720ms ease-out, staggered 55ms.

### Collection Band (signature)
The head of a collection card or page, filled with that collection's band colour, carrying its name in Display and its season in printed caps; the card body below carries the collection's tagline in Bodoni Moda italic. On hover the name tracks in slightly. The band shares a view-transition name with its collection page header and morphs between them (420ms ease-out with a brief 2px blur at 35%).

### Room Window
A square-cornered photograph frame on Deep Board showing the selected cloth hung in a room: portrait on the home hero, 4:5 in design rows (max 72svh), 4:3 on mobile.

## Do's and Don'ts

### Do:
- **Do** put every new surface on card stock over mill board, with a punched ring hole at the card's top-left.
- **Do** show cloth as square, pinked swatches with the cloth shadow and a small per-swatch tilt.
- **Do** head anything about a collection with that collection's band colour and nothing else's.
- **Do** set printed particulars (season, technique, counts, shade codes) in Jost tracked caps beside or below what they describe.
- **Do** pass every display string through the W/V kern helper, and keep the wordmark's full stop centred with measured spacing.
- **Do** use ease-out `cubic-bezier(0.16, 1, 0.3, 1)` for lifts, crossfades and underline draws, and keep everything static under reduced motion.
- **Do** keep text on mustard Pause bands near-black and on every other band warm off-white.

### Don't:
- **Don't** round any corner; the only circles are holes and collection dots.
- **Don't** use a band colour as a general accent, button fill or section background.
- **Don't** place a small caps line above a heading as an introduction.
- **Don't** print a shade code that was not measured from the cloth.
- **Don't** add a fourth depth layer: no modals, glows, floating panels or decorative shadows beyond board, card and cloth.
- **Don't** lay work out as uniform project tiles with no card, band or swatch structure.
