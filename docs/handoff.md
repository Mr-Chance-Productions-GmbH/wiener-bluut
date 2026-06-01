# Handoff: Wiener Bluut — Artist Website

## Overview
Marketing / booking website for **Wiener Bluut**, a Berlin-based musical duo — singer **Hella Duny** (born Viennese) and pianist **Klaus Schäfer**. Repertoire: traditional Viennese songs, Georg Kreisler black-humor classics, couplets, Schlager and Gassenhauer. Theme: *"Von der Donau an die Spree — Berliner Mutterwitz trifft Wiener Schmäh."* The "Bluut" (double-u) is a deliberate blood / black-humor pun.

This is a **starting-point clone** of the band's existing (dated) WordPress site. Content is real/recovered; the visual design is a fresh interpretation meant to be evolved further. All copy is in **German** and must stay German.

The site is a single-page, responsive marketing site with seven sections plus an in-browser content editor.

## About the Design Files
The files in `site/` are a **design reference created in plain HTML/CSS/vanilla-JS** — a working prototype showing the intended look, content architecture, and behavior. They are *not* required to be shipped verbatim.

The task is to **recreate this design in the target codebase's environment** using its established patterns and libraries. Since the developer is starting fresh in a local repo with no framework yet, **choose the most appropriate stack**. Recommendation given the requirements (static, content-editable, simple to host): a static-site generator with a data-driven content layer — e.g. **Astro** or **11ty (Eleventy)** with content in Markdown/JSON/YAML, or keep the current vanilla approach if minimal tooling is preferred. Avoid a heavy SPA framework; this is a brochure site.

That said, the current vanilla implementation is clean and fully functional — porting it 1:1 is a legitimate option. The most important architectural idea to preserve is **content/markup separation** (see "Content Architecture" below), which is the client's explicit requirement.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and layout are all defined and intentional. Recreate the look faithfully. Exact tokens are listed under "Design Tokens." The only placeholders are images (see "Assets").

## Content Architecture (client's key requirement)
The client explicitly wants a **simple authoring workflow so non-technical people can update flexible content (dates, program, testimonials, contact) without editing HTML.**

Current implementation:
- **`site/js/content.js`** holds a single object `window.SITE_CONTENT` with every piece of editable content. This is the single source of truth.
- **`site/js/app.js`** renders the entire DOM from that object on load.
- An **in-browser editor** (open the site with `#edit` in the URL, or click "Inhalte bearbeiten" in the footer) renders forms for Termine / Programm / Stimmen / Texte / Kontakt, persists edits to `localStorage`, and can **export an updated `content.js`** for the user to drop back into the project.

**When porting:** preserve this separation. In Astro/11ty, the natural equivalent is content collections / data files (JSON, YAML, or Markdown front-matter) edited directly or via a lightweight CMS (e.g. Decap/Netlify CMS, TinaCMS, or Sveltia). If you keep it framework-free, keep the `content.js` + render + editor pattern. **Do not hardcode dates/program/quotes into templates.**

## Screens / Views
Single page, vertical scroll. Sticky header. Sections in order:

### 1. Header (sticky)
- **Layout:** full-width sticky bar, 70px tall, translucent paper background with `backdrop-filter: blur(10px)`, 1px bottom border. Inner content constrained to max-width 1180px with responsive gutter.
- **Left:** brand wordmark "Wiener Bluut" in Bodoni Moda 600, 1.5rem, `white-space: nowrap`. The "uu" is wrapped in a span colored oxblood.
- **Right:** nav links (Programm, Termine, Stimmen, Galerie) — uppercase, 0.86rem, letter-spacing 0.08em, color ink-soft, hover → oxblood. Plus a pill CTA "Anfragen" (1px ink border, 999px radius; hover → ink fill, paper text).
- **Mobile (≤880px):** links collapse into a hamburger (`.nav-toggle`, three 24×2px bars). Menu slides down from under the header as a full-width paper panel; closes on link tap.

### 2. Hero (`#hero`, `.hero`)
- **Background:** solid oxblood with a radial-gradient highlight at top-right (`radial-gradient(120% 90% at 78% 12%, oklch(0.48 0.12 30 / 0.55), transparent 60%)`). Text is paper-colored.
- **Layout:** two-column grid `1.1fr 0.9fr`, gap ~72px, vertically centered. Collapses to one column on mobile, with the image moved above the copy (`order: -1`, capped 320px tall).
- **Left column:**
  - Kicker: "Lieder · Couplets · schwarzer Humor" — uppercase, 0.72rem, letter-spacing 0.28em, **gold**.
  - H1: "Wiener Bluut" — Bodoni Moda 600, `clamp(3.4rem, 11vw, 8.5rem)`, line-height 1.04, letter-spacing -0.01em. The "uu" is gold.
  - Subtitle: "Eine Wienerin mit Charme & Schmäh" — Bodoni Moda *italic*, `clamp(1.3rem, 3vw, 2rem)`, paper at 92% opacity.
  - Intro paragraph: paper at 78% opacity, max-width 46ch.
  - Two CTAs in a flex row, 14px gap: primary "Termine" (gold fill `.btn-gold`, ink text) → `#termine`; ghost "Anfragen" (paper border, hover → paper fill/oxblood text) → `#kontakt`.
- **Right column:** image placeholder, aspect-ratio 4/5, dark-variant striped placeholder (`.ph.on-dark`) with monospace caption "Foto: Hella Duny & Klaus Schäfer auf der Bühne".

### 3. About / The Duo (`#about`, `.about`)
- **Background:** paper. **Layout:** grid `1.2fr 0.8fr`, gap ~72px, align-items start. One column on mobile.
- **Left:** section label "Das Duo" (uppercase 0.72rem / 0.28em / oxblood, with a 28px leading rule), H2 "Charme, Schmäh und schwarzer Humor" (`clamp(2rem, 4vw, 3.2rem)`), then three body paragraphs in ink-soft.
- **Right (`.members`):** two member cards stacked, 22px gap. Each is a grid `92px 1fr`: a square 1:1 striped placeholder + name (Bodoni 1.35rem), role (0.85rem, oxblood, 600), note (0.82rem, ink-soft).
  - Member 1: Hella Duny / "Gesang" / "Gebürtige Wienerin · Charme & Schmäh".
  - Member 2: Klaus Schäfer / "Klavier & zweite Stimme" / "Vollblutpianist".

### 4. Programm (`#programm`, `.programm`)
- **Background:** paper-2 (slightly darker cream). **Header block:** section label "Das Programm", H2 "Vom Wienerlied bis zum Gassenhauer", lead paragraph (max 60ch).
- **Grid:** `repeat(auto-fill, minmax(280px, 1fr))`, 1px gap over a line-colored background so cards read as a hairline-divided grid; 1px outer border, 2px radius, overflow hidden.
- **Card (`.prog-card`):** paper background, ~38px padding, hover → paper-2. Contains a two-digit number ("01"…) in gold-deep mono-style label (0.72rem, 0.18em, 700), H3 (Bodoni 1.5rem), and a 0.95rem ink-soft paragraph. Six items (Wiener Lieder, Georg Kreisler, Couplets & Frivoles, Schlager & Gassenhauer, Otto Reutter · Hugo Wiener, Friedrich Hollaender).

### 5. Termine / Events (`#termine`, `.termine`)
- **Background:** paper. Header: section label "Termine", H2 "Kommende Auftritte", lead.
- **Event list (`.events`):** rows separated by 1px top/bottom borders. Each row (`.event`) is a grid `130px 1fr auto`, ~40px gap, vertically centered, hover → paper-2.
  - **Date block** (centered): day in Bodoni 2.4rem, month abbrev (German: Jän, Feb, Mär, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Dez) uppercase 0.72rem oxblood 700, year 0.72rem ink-soft.
  - **Middle:** event title (Bodoni 1.4rem) + meta line ("Venue, City · HH:MM Uhr" with venue bold, address on second line, all 0.9rem ink-soft).
  - **Action:** if `ticket` URL present → primary button "Tickets" (opens new tab); else ghost button "Reservieren" → `#kontakt`.
  - Events are **sorted ascending by ISO date** at render time. Empty list shows an italic fallback message.
  - Below the list: an italic disclaimer note.
- **Mobile (≤560px):** grid becomes `64px 1fr`, action button drops to full-width new row; day shrinks to 1.9rem.

### 6. Besucherstimmen / Testimonials (`#stimmen`, `.stimmen`)
- **Background:** **oxblood-deep** (the darkest section). Text paper-colored. Section label + label rule recolored to **gold**.
- Header: label "Besucherstimmen", H2 "Was das Publikum sagt", italic Bodoni intro line (paper 70%).
- **Quotes:** CSS multi-column masonry — `columns: 3 280px; column-gap: 26px`. Each `.quote` is `break-inside: avoid`, with a faint paper-tint background (`oklch(... / 0.05)`), 1px light border, 28px padding, 26px bottom margin.
  - A large gold opening quote mark (Bodoni 3rem), the quote text in Bodoni *italic* 1.08rem (paper 95%), and the author in Archivo uppercase 0.78rem / 0.1em / gold / 600.
- **Mobile (≤880px):** single column.

### 7. Galerie (`#galerie`, `.galerie`)
- **Background:** paper. Header: label "Galerie", H2 "Bühne & Backstage".
- **Grid (`.gal-grid`):** `repeat(auto-fit, minmax(220px, 1fr))`, 14px gap. Each tile is a 4:3 striped placeholder. **First tile spans 2 columns at 16:9** (becomes 1 column / 4:3 on ≤560px). Six tiles.

### 8. Kontakt / Booking (`#kontakt`, `.kontakt`)
- **Background:** paper-2. **Layout:** grid `0.9fr 1.1fr`, gap ~80px, align-items start. One column on mobile.
- **Left:** label "Kontakt & Booking", H2 "Wiener Bluut buchen", intro paragraph, then `.k-detail` blocks (key in uppercase 0.72rem/0.16em/oxblood/700; value in Bodoni 1.3rem) for E-Mail (mailto link), optional Telefon (tel link), and Ort.
- **Right — booking form (`form.booking`):** stacked grid, 16px gap.
  - Row of two: Name (required), E-Mail (required, type=email).
  - Row of two: Anlass (text, placeholder "Vernissage, Feier, Konzert …"), Wunschtermin (type=date).
  - Nachricht (textarea, required, min-height 130px).
  - Submit button (primary/oxblood) "Anfrage senden", plus a small note.
  - Fields: paper background, 1px line border, 2px radius, 13–14px padding; focus → 2px oxblood outline (inset).
  - **Behavior:** on submit, if `kontakt.formAction` is set, POST the form to that endpoint; otherwise build a `mailto:` with subject "Booking-Anfrage — {Anlass}" and a body containing the field values, and open the mail client. (When porting, swap to the codebase's preferred form handling — but keep the mailto fallback when no endpoint is configured.)

### 9. Footer (`.site-footer`)
- **Background:** ink (warm near-black), paper text. Flex row, space-between, wraps on mobile.
- **Left:** brand "Wiener Bluut" (Bodoni 1.6rem, "uu" gold), a note line (paper 60%), and a subtle underlined text button "Inhalte bearbeiten" that opens the editor.
- **Right:** social links (Instagram, Facebook, YouTube) — uppercase 0.82rem, paper 80%, hover → gold.

## Interactions & Behavior
- **Smooth scroll** via `html { scroll-behavior: smooth }`; all nav/CTA links are in-page anchors.
- **Sticky translucent header** with blur.
- **Mobile menu** toggles `.open` class (slide-down); closes on link click.
- **Hover states** on nav links, buttons, program cards, event rows, gallery is static.
- **Booking form** → mailto or configured POST endpoint (see above).
- **Content editor** (`#edit` or footer button): slide-in right panel with backdrop, tabbed (Termine / Programm / Stimmen / Texte / Kontakt), add/remove/edit items, Save (→ localStorage + re-render), Export (→ downloads regenerated `content.js`), Reset (→ clears localStorage, reloads defaults). Toast notifications for feedback. **This editor is optional to port** — in a SSG, a real CMS or direct data-file editing replaces it. Discuss with the client which they prefer.
- **Responsive breakpoints:** 880px (layout collapse, mobile nav) and 560px (event row + form + gallery adjustments).

## State / Data
- Single content object (`SITE_CONTENT`) — see `content.js` for the full schema. Top-level keys: `site`, `hero`, `about`, `programm`, `termine`, `stimmen`, `galerie`, `kontakt`, `footer`.
- `termine.events[]`: `{ date: "YYYY-MM-DD", time, title, venue, city, address, ticket }`.
- `programm.items[]`: `{ title, text }`. `stimmen.quotes[]`: `{ text, author }`. `galerie.images[]`: array of caption strings.
- `kontakt`: `{ label, title, intro, email, phone, location, formAction }`.
- Editor persistence key: `localStorage["wienerbluut_content_v1"]`.

## Design Tokens
Colors are authored in **OKLCH** (keep them — they're intentional and harmonious). Approx hex in parentheses for reference only.
- `--paper`        `oklch(0.96 0.012 85)`  (~#f4efe6) — main background, light text on dark
- `--paper-2`      `oklch(0.93 0.016 82)`  (~#ece4d6) — alt section background
- `--ink`          `oklch(0.22 0.015 40)`  (~#2b2622) — primary text, footer bg
- `--ink-soft`     `oklch(0.38 0.012 50)`  (~#54504a) — secondary text
- `--oxblood`      `oklch(0.38 0.11 25)`   (~#7a2d28) — hero bg, primary accent
- `--oxblood-deep` `oklch(0.27 0.075 25)`  (~#532019) — testimonials bg
- `--gold`         `oklch(0.74 0.09 78)`   (~#cda35e) — accent, "uu", gold buttons
- `--gold-deep`    `oklch(0.62 0.09 72)`   (~#a9803f) — gold hover, numerals
- `--line`         `oklch(0.22 0.015 40 / 0.16)` — hairlines on light
- `--line-light`   `oklch(0.96 0.012 85 / 0.22)` — hairlines on dark

**Type:**
- Display/headings: **Bodoni Moda** (Google Fonts; weights 400–700, italic 400/500; optical sizing 6–96). High-contrast playbill serif.
- Body/UI: **Archivo** (Google Fonts; weights 400/500/600/700).
- Monospace (placeholder captions only): system mono stack.
- Scale: H1 clamp(3.4–8.5rem); section H2 clamp(2–3.2rem); H3 1.5rem; body 18px base / line-height 1.6; lead 1.15rem. Uppercase labels 0.72rem with 0.28em letter-spacing.

**Layout:** max content width 1180px; gutter `clamp(20px, 5vw, 64px)`; section vertical padding `clamp(64px, 9vw, 130px)`.
**Radius:** 2px on cards/inputs, 999px on pills/buttons. **Shadows:** used sparingly (mobile nav drop, editor panel).

## Assets
**No real images yet** — every image is a striped CSS placeholder (`.ph`) with a monospace caption describing the intended shot (e.g. "Foto: Hella Duny", "Foto: Klaus am Klavier"). Replace with real photography of the duo. Needed shots: hero (duo on stage, portrait 4:5), two member portraits (1:1), six gallery images (one 16:9 lead + five 4:3). No icon set is used. Fonts load from Google Fonts CDN — self-host if offline/perf matters.

## Files
- `site/index.html` — page shell: `<head>` (fonts, meta), empty section containers, script includes.
- `site/css/styles.css` — all styles + design tokens (`:root`), responsive rules, editor styles.
- `site/js/content.js` — the editable content object (`window.SITE_CONTENT`). **Single source of truth.**
- `site/js/app.js` — render functions (one per section) + the content editor + mailto form handling.

Open `site/index.html` directly in a browser, or serve the folder (`python3 -m http.server`) to preview. Append `#edit` to try the content editor.
