# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

v2 (this folder): the same site, rendered from editable content files (`content/`) through a block library (`src/blocks/`), plus a local visual editor, the Studio, built on the open-source Puck editor. `npm run studio` runs both; `npm run build` makes the static site for GitHub Pages with no editor code in it.

Delegated: Next.js 16 (App Router) + React 19 + TypeScript, plain CSS modules. Chosen because the owner asked for the installed Vercel React skills to be used and hosting is undecided (Vercel is the natural target; a static export also works). Runs locally with `npm run studio`.

## Users

- Editor (v2): Shruchi herself, through the Studio on her own laptop. She is a textile designer, not a coder: fluent in Canva, Instagram and Figma-like tools. She changes words, photos, sections, pages, collections and colours, then publishes with GitHub Desktop. The design system stays fixed; she chooses within it.
- Primary: people who come across Shruchi's work (friends, peers, collaborators, curious buyers of her Yellow Dwelling designs, design-world contacts) and want to see the full body of her textile work and how she thinks.
- The site is a personal showcase, not a sales funnel. No hard sell, no pricing, no services menu.

## Product Purpose

A personal home for the textile work of Shruchi Jaiswal, an NID-trained textile designer and Design Lead at The Yellow Dwelling (Bangalore). It gathers what is currently scattered across Behance, Instagram and a shop catalogue into one place that does justice to her craft: the finished collections, the research behind them, and her way of thinking. Success: a visitor leaves understanding that one person's hand and mind are behind hundreds of designs, and remembers at least one story (the hidden masks of Sura, the cotton boll of Kapaas, the folk-tale goodie bag).

## Positioning

Her work sits where Indian craft traditions (Ajrak, Kalamkari, Tangaliya, Kantha, Ikat, temple borders, zari) meet contemporary, livable home textiles. She researches a place, ritual or object (a harvest festival, a dance, a cotton field, a mask), extracts motifs, and translates them into cloth made with artisans or at production scale. Few portfolios can show both artisan collaborations and 700+ shipped home-furnishing products.

## Operating Context

- Work types: print and pattern design, woven and embroidered surfaces, home furnishings (curtains, blinds, cushions, bed and dining linen, fabric by the metre), apparel and accessories, product/bag design.
- Craft collaborations: Tangaliya weavers (Gujarat), Kutchi Kantha embroiderers on khadi, Kalamkari block printers (Andhra Pradesh), Ikat masters (Odisha workshop).
- Professional: Design Lead at The Yellow Dwelling, a Bangalore home-furnishings brand (100% cotton & linen; stores in BLR, HYD, PNQ, MAA, TVM). The owner states every product there is her design (last 2–3 years especially).
- Earlier client work with "This and That", an Ahmedabad design studio (Kaantha cushions, Tangaliya bed collection).

## Capabilities and Constraints

- Sections inherited from the reference site (the-studio-craft…chatgpt.site), to be rewritten around her actual work: Home, Collection(s), Process, Journal (notes/thinking), Contact.
- Content sources: 12 Behance projects (text + images), 66 curated designs from 5 Yellow Dwelling collections with official product descriptions, Instagram (ras.ruchi, theyellowdwelling) for context only.
- Contact: placeholder email `xyz@gmail.com` (owner will replace) + Instagram (@ras.ruchi) + Behance.
- Undecided: final domain, hosting, whether to add a portrait of Shruchi, whether to add more personal writing in her own voice.

## Brand Commitments

- Name: **ras.ruchi** (her Instagram handle; "ras" = essence/flavour/emotion, "ruchi" = taste, from her name Shruchi). Her full name, Shruchi Jaiswal, appears as the person behind it.
- Voice: first-person where quoting her own Behance writing; otherwise warm, specific, craft-literate. No invented quotes.
- Credit collaborators and clients accurately: The Yellow Dwelling, This and That studio, NID, the artisan communities.

## Evidence on Hand

- `src/data/behance.json` – 12 projects with her own descriptions, images in `public/images/behance/`.
- `src/data/yellow-dwelling.json` – collections Rasaa (Festive '26), Entwine (Summer '26), Ratna (Festive '25), Pause (Summer '25), Earlier seasons (2022–24); product photos in `public/images/tyd/`; each links to the live product.
- Facts: NID alumna; Design Lead @ The Yellow Dwelling; Behance member since Dec 2018; Chitrakatha '19 goodie bag cost Rs. 135 per unit and needed 4 stitch lines.
- Absent (do not fabricate): testimonials, awards, client logos beyond those named, years of experience, a written bio in her voice, a portrait (none downloaded), prices.
- Ratna is the Festive 2025 collection (confirmed by the owner). Its line: "rooted, royal, reimagined".

## Product Principles

1. The work leads. Every screen should be mostly cloth, pattern and colour; interface recedes.
2. Story over catalogue. Show the why (inspiration → motif → cloth) not just the what.
3. Honour the hands. Name the crafts, places and communities behind each piece.
4. Range with coherence. Show breadth (student craft to 700 shipped products) as one continuous practice.
5. Truthful by default. Use her words and the brand's descriptions; never invent claims.

## Accessibility & Inclusion

WCAG 2.2 AA: meaningful alt text for every artwork, keyboard-navigable galleries, reduced-motion respected, readable contrast over imagery.
