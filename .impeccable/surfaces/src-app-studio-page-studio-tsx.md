---
version: 1
slug: "src-app-studio-page-studio-tsx"
primary_target: "src/app/studio/page.studio.tsx"
related_targets: ["src/studio"]
---

# Studio (ras.ruchi editor)

Scope: the local editor Shruchi uses to change every page, photo, collection and setting of ras.ruchi. Visitor mode: Operate. Runs only on her laptop (`/studio` in dev); never published.

Audience: Shruchi, a textile designer, not a coder; fluent in Canva, Instagram and Figma-style tools, used to handling cloth, swatches and shade cards. Job: change words, add and arrange sections and photos, make new pages, then preview and publish. Constraint: the site's design system (DESIGN.md) is locked; she chooses from it, never breaks it.

Chosen structure: "The page fills the screen" (sketch: .impeccable/mocks/decision/canvas-first.html).

## Direction contract

THESIS: Her real page is the editor. She points at what she wants to change and the tools come to it: + Add section between sections, a toolbar on the clicked block, a settings drawer only for what's selected. Refuses the three-permanent-panels workbench (Webflow/Elementor) where chrome outweighs the page.

OWN-WORLD: The site's own materials as tool chrome: mill board (#d6d6d1) workspace, card stock (#f4f4f1) top bar, rail and drawer, ink (#161615) for text and primary buttons, Kadamba oxblood (#6a2222) only for selection, insertion and focus (DESIGN.md names it the system's one interactive band colour). Jost for every UI word at a fixed rem scale; printed tracked caps for panel labels; Rozha One only for the Studio's name and page names in pickers. Square corners except the round + Add pill and punched holes.

STORY: She opens the Studio and sees her site, not a dashboard. She clicks the words and types. Hovering a gap offers + Add section; a gallery of section designs shows real thumbnails. She drops photos in, picks a focal point, checks the phone view, presses Preview, then Publish. She never sees code, never loses work (autosave, undo, history).

FIRST VIEWPORT: 52px card-stock top bar: "ras.ruchi Studio" (Rozha One 21px), page picker, undo/redo, Desktop/Tablet/Phone switch, saved status in printed caps, Preview (solid ink). 72px icon rail at left: Pages, Add, Photos, Collections, Site, History, Help. The live page fills the middle on mill board. Selected block: 2px oxblood outline with a dark floating toolbar (Edit, up, down, Duplicate, Hide, Delete). 340px settings drawer at right with breadcrumb, block name, tabs Content / Layout, fields as chips, segmented controls and inputs. A dashed oxblood line with a round "+ Add section" pill appears between sections on hover.

FORM: Canvas-first contextual editor; position 1 on the ordered list (dealt index 1 of 7; the roll's lead was document mode). seed: none (unavailable): the surface roll ran and its dealt hand is recorded in the decision payload, but this CLI version (4.5.2) prints no SEED REFERENCE line. Signature move: blocks are dealt onto the page the way swatches are dealt onto a card. A new block falls in from above with the site's deal motion (26px, -9deg to rest, 720ms ease-out), and the section gallery is laid out as a shade card of swatch-like thumbnails.

## Recorded adaptations

Decided after the first finish review; each keeps the contract's intent:
- Publish is the solid ink button and Preview is outlined: the story ends on Publish, so it carries the primary weight.
- Find (Cmd K) sits in the top bar: the research named a command palette as the quickest route for a non-coder to any page, block or panel.
- Layers sits in the rail: the outline is the only way to reach small or nested blocks (columns, cards) without precise clicking.
- The block toolbar names the block ("Section", "Photo") instead of an Edit button: clicking the block already opens its settings, so the label tells her what she selected.
- New blocks deal in at -0.6deg, not the swatch's -9deg: a whole section turning nine degrees reads as a glitch, not cloth; the swatch keeps -9deg.
- Below 768px wide the canvas opens in Phone view, so her page keeps its real proportions.
- The seam has no separate dashed line: Puck already outlines the hovered block in oxblood, and the "+ Add section" pill sits on that outline's lower edge, where a dashed line would only draw over it unseen.
- The breadcrumb ends with the selected block ("Home › Columns › Photo"); the earlier steps are underlined links back up the page.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
