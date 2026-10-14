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
  studio-raised: "#fbfbf9"
  studio-sunk: "#e9e8e3"
  studio-surround: "#c3c3bd"
  studio-ink-3: "#66665f"
  studio-hair: "rgb(22 22 21 / 0.13)"
  studio-hair-strong: "rgb(22 22 21 / 0.32)"
  studio-accent-hover: "#551b1b"
  studio-on-accent: "#fbf6f1"
  studio-good: "#2f5d3a"
  studio-warn: "#7d5300"
  studio-bad: "#a12a1c"
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
  studio-caps:
    fontFamily: "Jost, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.12em"
  studio-label:
    fontFamily: "Jost, Avenir Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.3
  studio-control:
    fontFamily: "Jost, Avenir Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
  studio-body:
    fontFamily: "Jost, Avenir Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  studio-title:
    fontFamily: "Jost, Avenir Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
  studio-page-name:
    fontFamily: "Rozha One, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.005em"
rounded:
  none: "0px"
  hole: "50%"
  pill: "999px"
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
  studio-topbar:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    height: "56px"
  studio-rail:
    backgroundColor: "{colors.card}"
    width: "68px"
  studio-left-panel:
    backgroundColor: "{colors.card}"
    width: "320px"
  studio-settings-drawer:
    backgroundColor: "{colors.card}"
    width: "340px"
  studio-button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.studio-control}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  studio-button-secondary:
    backgroundColor: "{colors.studio-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.studio-control}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  studio-field:
    backgroundColor: "{colors.studio-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.studio-body}"
    rounded: "{rounded.none}"
    padding: "7px 10px"
    height: "36px"
  studio-insert-pill:
    backgroundColor: "{colors.band-ratna}"
    textColor: "{colors.studio-on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 14px 0 10px"
    height: "30px"
  studio-insert-pill-hover:
    backgroundColor: "{colors.studio-accent-hover}"
  studio-gallery-sheet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "30px 13px 14px"
    width: "236px"
  studio-sheet-hole:
    backgroundColor: "{colors.board}"
    rounded: "{rounded.hole}"
    size: "13px"
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

# Studio Surface: the editor (Operate mode)

Everything above governs her site. This part governs one other surface: the Studio, the local visual editor at `/studio`. It runs only under `next dev` and never ships in the static build. Its visitor is Shruchi alone, operating a tool, so it trades the site's fluid, catalogue-like scale for fixed sizes and dense controls. It keeps the site's materials and adds no new hue. Studio tokens are prefixed `studio-` in the frontmatter. In code they are the `--s-*` properties on `.root` in `src/studio/ui.module.css`, and the `--puck-*` overrides in `src/studio/studio.module.css`.

The thesis is the direction contract's: her real page is the editor. The canvas renders the real site through the same block library and stylesheets that build it. The chrome sits around the page and never restyles it.

**Key Characteristics:**
- The real page in the middle, on a mill-board surround one step deeper (#c3c3bd).
- Card-stock chrome (#f4f4f1) with field-stock controls (#fbfbf9), ink text and translucent hairlines.
- Kadamba oxblood (#6a2222) only where her hand is: selection, insertion, drop lines and focus.
- Jost at fixed pixel sizes; Rozha One only for the Studio's name and page names.
- Square corners everywhere except one round pill, "+ Add section".

## Studio Colors

The site's greys at tool density, with oxblood as the only colour of interaction.

### Primary
- **Ink Black** (`ink`, #161615): All chrome text and the solid Publish button. Also the pressed state of every segmented control, chip, device switch, icon toggle and gallery-kind button, the selected tab's 2px underline, Puck's block toolbar, toasts and the numbered publish steps.

### Accent
- **Kadamba Oxblood** (`band-ratna`, #6a2222; hover `studio-accent-hover` #551b1b; pressed #3f1414): The selected block's outline, Puck's drop line, the inline text editor's outline, every `:focus-visible` ring (2px, offset 2px), text selection (with #fbf6f1 text), the "+ Add section" pill, the dashed "add at end" box and the hover on a block tile's add button. Its tints run from 0.06 (selection fill, hover wash) to 0.18 (subtle interactive), 0.35 (inline-edit hint) and 0.45-0.5 (slot and dashed outlines).

### Neutral
- **Mill Board Grey** (`board`, #d6d6d1): The Studio's ground behind its panels, the canvas preview ground, and the ground of the section gallery's sheet area and plates.
- **Canvas Surround** (`studio-surround`, #c3c3bd): The deeper board around the canvas frame (`--puck-canvas-color-bg`), so her page reads as a sheet laid on the table.
- **Card Stock** (`card`, #f4f4f1): The top bar, the rail, both side panels, dialogs and the section-gallery sheets.
- **Field Stock** (`studio-raised`, #fbfbf9): Every input, select, textarea, segmented control, chip, menu, block tile, page picker, device switch, secondary button and welcome card. One step whiter than card stock, so a field reads as a fresh slip laid on the panel.
- **Sunk** (`studio-sunk`, #e9e8e3; Puck's subtle surface #ecebe6): The hover fill of ghost, icon and menu buttons, the switch's off track, the draft tag and tip boxes.
- **Press Grey** (`ink-2`, #4d4d48) and **Muted** (`studio-ink-3`, #66665f): Secondary text and breadcrumbs; placeholders, hints and disabled icons.
- **Hairline** (`studio-hair`, 0.13) and **Strong Rule** (`studio-hair-strong`, 0.32): Translucent ink, lighter than the site's 0.16 and 0.42. The hairline divides panel sections, heads and tabs. The strong rule borders fields, chips and secondary buttons, and turns to ink (#161615) on hover.
- **Status** (`studio-good` #2f5d3a, `studio-warn` #7d5300, `studio-bad` #a12a1c): Publish checks (good, improve, fix), the save-state dot (amber #b8862b while waiting or saving), error toasts, invalid fields and the danger button.

### Named Rules
**The Hand Rule.** In the Studio, oxblood marks only where her hand is: what is selected, where something will land, and what has focus. Buttons, tabs and pressed states are ink. Oxblood is never a panel, header or decorative fill.

**The No Azure Rule.** Puck's default azure and its radii are overridden by token. The tokens are set twice: on `.studio` and on the canvas iframe's own root (`html[data-studio-canvas]`). Selection outlines, drop lines, slot borders and the inline-edit outline inside the frame are oxblood too. A new editor feature that brings its own colour gets mapped onto these tokens before it ships.

## Studio Typography

**Font:** Jost for every word of the chrome; Rozha One for the Studio's name and page names, as on the site.

**Character:** A fixed, compact tool scale. Chrome sizes are set in pixels and do not change with the viewport. The working range is 12.5-15px, with small caps at its foot and dialog titles at its head.

### Hierarchy
- **Studio name** (Rozha One 400, 21px, -0.015em): "ras.ruchi" in the top bar, beside "Studio" in printed caps. The Welcome dialog sets the name at 34px.
- **Page name** (`studio-page-name`, Rozha One 400, 16px, -0.005em): The current page in the page picker. Page names are titles, as on the site.
- **Dialog title** (Jost 600, 17px, 1.25): Dialog heads. The command palette's input is also 17px, at 400.
- **Block name** (Jost 600, 16px, 1.25): The selected block's name in the settings drawer.
- **Panel title** (`studio-title`, Jost 600, 15px, 1.2): Side-panel heads; the "+ Add section" box at the end of a page; welcome card titles.
- **Control and body** (`studio-control` and `studio-body`, Jost 500 or 400, 14px): Buttons, tabs, inputs, menus, gallery kinds. Small buttons, segmented controls, chips, device buttons and breadcrumbs use 13px; tile names use 13.5px.
- **Label and hint** (`studio-label`, Jost 500 or 400, 12.5px, 1.3-1.4): Field labels, hints, errors, gallery notes, tip boxes and sheet descriptions. Tile descriptions are 12px, clamped to two lines.
- **Printed caps** (`studio-caps`, Jost 500, 11px, 0.12em, uppercase, Press Grey): Panel group headings, the save state and the "Studio" mark. The draft tag, hidden badge and palette kinds use 10.5-11px at 0.1em.

### Named Rules
**The Fixed Scale Rule.** Chrome type never uses `clamp()` or viewport units. This is a tool read at one distance on one laptop. The only fluid type the Studio draws is the empty-page heading inside the canvas, which takes the site's display scale because it stands in for her page.

**The Same Names Rule.** Wherever the Studio names a page, it uses Rozha One, as the site does. Every other Studio word is Jost.

## Studio Layout

The page fills the screen. The chrome is a top bar, a rail, one optional panel at the left and a settings drawer at the right.

- **Top bar** (56px, card stock, hairline foot): A three-column grid. At the left: the Studio name, the "Studio" caps and the page picker (max 260px, with a draft tag). In the centre: undo and redo, a 24px divider, and the Desktop / Tablet / Phone switch. At the right: the save state in printed caps with a status dot, Find (ghost, Cmd K), Preview (outlined) and Publish (solid ink, last). Below 1180px the device labels and the word "Find" drop to icons. Below 760px the bar keeps only the name, the page picker (max 150px) and Publish.
- **Rail** (68px, Puck's plugin bar at its default width, from 638px up): Pages, Add, Layers, Photos, Collections, Site, History and Help, each a 20px icon with a label. The Studio turns Puck's div items into real buttons with an oxblood focus ring.
- **Left panel** (320px): The open rail panel. A sticky 52px head, a 16px body pad, 18px between groups, and hairline-divided sections with 12px inside each.
- **Settings drawer** (340px): Opens for the selected block. Its head carries a breadcrumb, the block name and, when the block has a layout field, tabs. The breadcrumb reads "Home › Columns › Photo": the earlier steps are underlined buttons back up the page, and the last step is the selected block (`aria-current`, ink, 500). The tabs are Content and Layout, 14px, 18px apart, with a 2px ink underline on the selected one. Layout holds the layout control and Content holds everything else. Puck's own section titles and field-type icons are hidden.
- **Canvas**: Puck's iframe showing the real page at Desktop (1440px), Tablet (768px) or Phone (390px), on the #c3c3bd surround.
- **Phone view**: When the Studio opens in a window narrower than 768px, the canvas starts in Phone view (390px), so her page keeps its real proportions instead of shrinking a desktop layout.
- **Rhythm**: Control heights step 26 / 28-30 / 34-36px; gaps step 4 / 6 / 8 / 12 / 18px. Dialogs are 440px (s), 640px and 1040px (l) wide, capped at min(86dvh, 900px).

## Studio Elevation & Depth

The chrome is flat: card stock divided by hairlines. Only things that float above the work take a shadow: dialogs, menus, toasts, the insert pill, lifted tiles and gallery sheets. The site's Three Layers Rule still governs her page. The Studio's floating layers belong to the tool and are never drawn into the page.

### Shadow Vocabulary
- **Studio Float** (`box-shadow: 0 1px 2px rgb(20 20 16 / 0.12), 0 18px 44px -20px rgb(20 20 16 / 0.5)`): Dialogs, menus and toasts. Dialogs sit over a backdrop of rgb(20 20 16 / 0.42).
- **Insert Pill** (`box-shadow: 0 4px 14px -6px rgb(20 20 16 / 0.6)`): The "+ Add section" pill, so it reads above the page it sits on.
- **Tile Lift** (`box-shadow: 0 8px 18px -12px rgb(20 20 16 / 0.5)`, up 2px): A block tile in the Add panel under the hand.
- **Sheet at Rest and Lifted**: Gallery sheets use the site's Card Stock shadow at rest. Under hover or focus they deepen to `0 1px 0 rgb(255 255 255 / 0.5) inset, 0 2px 4px rgb(20 20 16 / 0.14), 0 22px 40px -18px rgb(20 20 16 / 0.5)`.
- **Punched Hole**: The site's hole shadow on the 13px sheet hole.

### Motion
- **Block deal**: A block added from the gallery or the Add panel falls into the page from 26px above at -0.6deg, over 720ms with ease-out `cubic-bezier(0.16, 1, 0.3, 1)`. It is the site's swatch deal at the scale of a section. The swatch keeps its -9deg, because a whole section turning nine degrees reads as a glitch, not cloth.
- **Insert pop**: The pill appears from scale 0.9 and opacity 0 over 220ms.
- **Dialog and toast deal**: Up 14px from opacity 0 over 320-360ms.
- **Sheet lift**: 360ms ease-out (see the gallery below).
- Under reduced motion, the deal, pop, dialog, toast and sheet motion are all off.

## Studio Shapes

Square (0px) everywhere: buttons, fields, chips, tiles, panels, dialogs, menus, toasts and the switch. Puck's radius tokens are all zeroed. The circles are the system's own: punched holes (13px on gallery sheets), the 7px save-state dot and the spinner.

### Named Rules
**The One Pill Rule.** "+ Add section" is the only rounded control (999px). The one action that grows her page looks different from every square control that edits it.

## Studio Components

### Buttons
- **Shape:** Square (0px), 36px tall (small: 30px, 13px type), padding 0 14px, Jost 500 14px, with an optional leading 17px icon.
- **Primary:** Ink fill with card-stock text at 600; hover #2c2c2a. Publish is the primary in the top bar and the last action on the right.
- **Secondary:** Field stock with a strong-rule border that turns to ink on hover. Preview uses it.
- **Ghost:** No border or fill; Sunk on hover. Find uses it.
- **Danger:** Outlined in the error red; filled red with white text on hover.
- **Press and disabled:** Pressing nudges the button down 1px. Disabled is 45% opacity, with no nudge.
- **Icon buttons:** 34px square (small 28px), Sunk on hover, ink fill when pressed.

### Segmented controls, chips and the device switch
Field stock in a strong-rule frame, with hairline dividers between segments. Text is Press Grey at 13px. Hover turns it to ink on Sunk; the pressed segment is filled ink with card-stock text. Chips are separate 32px rectangles with the same states.

### Inputs / Fields
- **Style:** Field stock, 1px strong-rule border, square, 36px minimum height, padding 7px 10px, Jost 400 14px / 1.45. Textareas start at 84px; selects carry a drawn ink chevron.
- **Hover / Focus:** Hover darkens the border to Press Grey. Focus draws a 2px oxblood outline at -1px and turns the border oxblood.
- **Error:** Error-red border; the message sits below at 12.5px.
- **Switch:** A 38 × 22px square track, Sunk when off and ink when on, with a 16px field-stock thumb sliding over 200ms.

### Block toolbar
Puck's action bar, square and ink-filled with card-stock text. It names the block ("Section", "Photo") instead of showing an Edit button, because clicking the block already opens its settings. Then come Move up, Move down, Hide or Show on the site, and the remaining actions. A hidden block stays on the canvas at 38% opacity with a dashed 1.5px outline and a "Hidden from the site" badge.

### "+ Add section" pill (signature)
A round oxblood pill (30px tall, 999px radius, Jost 600 13px, #fbf6f1 text, bold 14px plus icon). It is centred on the lower edge of a hovered or selected block, riding the oxblood outline Puck already draws there. No separate seam line is drawn. Inside a nested zone it shrinks to 26px and reads "Add here". It opens the section gallery at that position. The end of a page carries a 96px dashed oxblood box with the same action.

### Add panel tiles
A two-column grid of field-stock tiles (92px minimum, hairline 0.16 border), each with an icon, a 13.5px name and a two-line description. Tiles are draggable onto the page. A 26px add button at the top-right turns oxblood on hover. Under the hand a tile's border goes ink and it lifts 2px. At the top, a full-width ink "Section designs" button opens the gallery.

### Section gallery as a shade card (signature)
A large dialog (1040px). A 180px sticky list of kinds sits at the left, with the pressed kind in ink, and a note under it. The sheets area to the right is mill board, with 236px sheets in an auto-fill grid (gaps 30px by 22px).
- **Sheet:** Card stock with the Card Stock shadow, a punched 13px hole at 10px from the top-left, and padding 30px 13px 14px. A deterministic tilt from -1.05deg to +1.05deg (steps of 0.35deg) glues it to the board a little crooked, in the same range as the site's swatches.
- **Plate:** 158px tall on board. It shows a real render of the design through the site's own block config, laid out at 1200px (820px for word-led designs) and zoomed to 210px wide. The render uses her own photographs, and the note says that the section itself arrives with empty places for hers.
- **Handling:** Hover or keyboard focus lifts the sheet 6px and tilts it a further 1.5deg with the lifted shadow, over 360ms ease-out. Focus adds a 2px oxblood outline at 4px offset, and pressing settles it to 2px. The title is the button, and it covers the whole sheet. Choosing a sheet deals the section onto the page with the block deal.

### Dialogs, menus, toasts, command palette
Dialogs are card stock with Studio Float. Each has a 17px head and a hairline-ruled foot that right-aligns its actions. Menus are field stock, 200px minimum, with 34px rows that are Sunk on hover; destructive rows are red. Toasts are ink (red for errors), centred 22px from the bottom, with an outlined action. The command palette has a 46px ink-bordered input at 17px. Its active row is ink, and printed-caps kinds sit on the right.

## Studio Do's and Don'ts

### Do:
- **Do** let the canvas render the real site through the site's block library and stylesheets. What she sees in the Studio is what ships.
- **Do** keep the Studio's chrome in card stock, field stock, ink and hairlines, and reserve Kadamba oxblood for selection, insertion, drop lines and focus.
- **Do** map any new Puck surface onto the `--puck-*` tokens on both `.studio` and `html[data-studio-canvas]`, so no azure or rounding appears inside or outside the frame.
- **Do** set chrome type in Jost at fixed pixel sizes (12.5-15px core), with Rozha One for the Studio name and page names only.
- **Do** keep "+ Add section" the single round pill, on the lower edge of the hovered block's outline.
- **Do** make Publish the solid ink button at the far right, with Preview outlined beside it.
- **Do** name the selected block in its toolbar and end the drawer's breadcrumb with it, with earlier steps as underlined links back up the page.
- **Do** show section designs as real, scaled renders on punched, tilted card-stock sheets that lift when handled.
- **Do** deal new blocks in at -0.6deg from 26px over 720ms, and leave the -9deg deal to swatches.
- **Do** open the canvas in Phone view (390px) when the window is narrower than 768px.
- **Do** turn every Studio motion off under reduced motion.

### Don't:
- **Don't** let any Studio style reach her page. The chrome never restyles her page, its type, its spacing or its colours; the canvas frame only receives the Studio's `--puck-*` tokens and the faded hidden-block treatment.
- **Don't** use oxblood as a button fill, panel or header colour in the chrome. The only oxblood fill is the "+ Add section" pill, which marks insertion.
- **Don't** leave any Puck azure or rounded corner unmapped, in the chrome or the canvas iframe.
- **Don't** use `clamp()` or viewport units for chrome type or chrome spacing.
- **Don't** round a Studio control other than the "+ Add section" pill.
- **Don't** draw a separate dashed seam line between sections; the pill rides Puck's existing outline.
- **Don't** show section designs as icons or wireframes; show the real blocks.
- **Don't** add a design token, colour or face to the Studio that her site does not already have, apart from the field, sunk, surround and status greys and colours recorded here.
