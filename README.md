# ras.ruchi v2: the site, and the Studio that edits it

The textile work of Shruchi Jaiswal, shown the way a mill shows cloth. This is v2 of the site: it looks exactly like v1, but every word, photo, page, collection, colour and setting now lives in editable files, and a visual editor called the **Studio** changes them without touching code.

Shruchi's guide to using the Studio is **[STUDIO_GUIDE.md](STUDIO_GUIDE.md)**.

## Quick start

| What | How |
|---|---|
| Edit the site | Double-click **Open Studio** (or run `npm run studio`), then go to http://localhost:3200/studio/ |
| See the site while editing | http://localhost:3200/ |
| See the finished site exactly as it will publish | Double-click **Preview Site** (or `npm run build && npm run preview`), then go to http://localhost:3300/ |
| Publish | In the Studio, press **Publish**, then Commit and Push in GitHub Desktop |

You need Node.js (LTS) once. The first launch installs everything else.

## How it fits together

```
content/                 everything she edits (the Studio writes these files)
  site.json                name, रसरुचि, email, shop, menu, footer, colour palette, page order
  collections.json         the collections library: designs, colourways, photos, swatches
  media.json               the photo library index
  pages/*.json             one file per page: its settings and its blocks, in order
public/images, public/media   the photographs (new uploads land in public/media)
src/blocks/              the design system as blocks: every section and element a page can hold
src/app/(site)/          renders any page from content/ (one catch-all route)
src/studio/              the Studio: the editor, its panels and controls (local only)
src/app/studio/, src/app/api/studio/   the Studio page and its save API (local only)
.studio/                 version history and the publish record (stays on the laptop)
```

- **One design system, two uses.** The blocks in `src/blocks/` render the published site on the server and render live inside the Studio's canvas. What she sees while editing is the real page.
- **The look is locked; the content is free.** Blocks offer named choices: sizes S to XL, the site's type styles, colours from her palette, frames, ratios and entrances. They never offer raw fonts, pixels or arbitrary CSS. Fonts (Rozha One, Bodoni Moda italic, Jost), the shade-card materials and the motion all come from `DESIGN.md`.
- **The Studio exists only on the laptop.** Files named `*.studio.tsx` / `*.studio.ts` are included only by the development server (`next.config.ts`). `npm run build` produces a static site in `out/` with no server and no editor.
- **Built on [Puck](https://puckeditor.com)** (`@puckeditor/core` 0.23), an open-source visual editor for React. Its chrome is restyled in the site's materials and extended with the Studio's own panels.

## The block library

| Group | Blocks |
|---|---|
| Words | Heading, Text (bold, italic, links, lists), Tagline, Quote, Keyword tags, Facts list, Button |
| Photos and video | Photo (crop, focal point, frames, caption, link), Gallery (grid, masonry, strip, feature, full-screen viewer), Photos at full size, Video (YouTube, Vimeo, Instagram, uploads), Swatches, Swatch window, Then and now |
| Layout | Section (heading, introduction, background), Columns (2 to 4, eight splits), Highlight card (card stock, punched hole, colour band), Free canvas (place anything anywhere, scales whole on phones), Space, Line |
| Her work | Home hero, Collection cards, Shade board, Study sheets, Process steps, Big word with examples, Quotes row |
| Page parts | Page title, Back link, Collection card, Previous and next collection, Study header, Study footer |

Every block shares the same layout choices: width (full, wide, text, narrow), space above, which screens show it, an entrance animation, an anchor name, and "hide from the site".

The "+ Add section" gallery has 25 ready-made section designs built from these blocks.

## The Studio's features

- **Editing:**
  - Typing directly on the page.
  - Drag-and-drop blocks and sections.
  - A toolbar on the selected block: move up, move down, hide, duplicate, delete.
  - Breadcrumbs to parent blocks.
  - Layers.
- **Photos:**
  - A library with upload (drag files anywhere in the Photos panel), search, folders and alt text.
  - "Used on" lists every place a photo appears; "Replace everywhere" swaps it across the site.
  - Focal points.
  - Uploads become sized WebP files with blur placeholders.
- **Collections:**
  - Edit collections, designs and colourways.
  - Cut swatches from photos, with the ground shade measured automatically.
- **Pages:**
  - Create from templates (blank, text, gallery, study, collection) or duplicate.
  - Rename, change the web address, add to or remove from the menu, reorder, draft or live.
  - Delete with recovery.
- **Site:**
  - Name, contact, shop, menu, footer, colour palette, share image.
- **Safety:**
  - Autosave, undo and redo per page.
  - Named versions of the whole site, earlier copies of each page, and deleted-page recovery.
  - "Discard changes since the last publish".
- **Checking:**
  - Desktop, tablet and phone views, plus a preview in a new tab.
  - A full static build preview.
  - Pre-publish checks: links to missing pages, empty blocks, missing photo descriptions, duplicate addresses, incomplete swatches.
- **Getting around:**
  - Cmd K finds any page, block or action.
  - Keyboard shortcuts, a welcome tour and a help panel.

## Putting v2 online

v2 publishes itself through GitHub Pages: pushing to `main` runs `.github/workflows/deploy.yml`, which builds `content/` into a static site and publishes it. There is no separate `github-repo` folder in v2; this folder is the repository.

**One time:**

1. Choose where v2 lives:
   - **Keep v1 live and try v2 separately:** create a new repository on github.com, for example `ras_ruchi_v2`.
   - **Replace v1:** use the existing `ras_ruchi` repository; v2's commits will replace v1's files there.
2. In GitHub Desktop: **File > Add Local Repository** and choose this folder (it is already a git repository).
3. Connect it to GitHub:
   - **New repository:** **Publish repository**, untick **Keep this code private** on a free plan.
   - **Existing repository:** **Repository > Repository Settings > Remote** and paste its address, for example `https://github.com/gadineeraj/ras_ruchi.git`. Then **Push origin**, which may ask to **Force push** because the histories differ.
4. On github.com: **Settings > Pages > Source: GitHub Actions**.

**Every update:** in the Studio press **Publish**, then **Commit to main** and **Push origin** in GitHub Desktop. The site updates in about two minutes.

## Commands

```bash
npm run studio     # the Studio and the site, on http://localhost:3200
npm run build      # the static site in out/ (set PAGES_BASE_PATH=/repo-name to build for a sub-path)
npm run preview    # serve out/ on http://localhost:3300
npm run lint
npm run migrate    # one-time: rebuild content/ from the v1 data in scripts/v1-data (overwrites content/)
```
