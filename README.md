# Wiener Bluut — website

Marketing & booking site for the Berlin duo **Wiener Bluut** (Hella Duny &
Klaus Schäfer). A single, fully static page.

## Hosting

Served by **GitHub Pages** — Settings → Pages → *Deploy from a branch*,
`main` / `/docs`. The `docs/.nojekyll` file keeps it a pure file server (no
build, no runner). Pushing to `main` is the deploy.

## Content & editing

- `docs/content.json` is the single source of truth; `docs/js/app.js` renders it
  client-side.
- Edits are made with the local [**Setzer**](https://github.com/crux/setzer) tool (`site_dir = docs`,
  `content_path = docs/content.json`): its in-page editor publishes changes back
  here as commits, which Pages then serves. No CMS, no backend.

## Layout

| Path | What |
|------|------|
| `docs/` | the published static site (served by Pages) |
| `archive/` | frozen, historical docs — valuable but not current (e.g. the design handoff) |
| `Makefile` | `make serve` for a local preview |

Current docs live at root; superseded snapshots go in `archive/`.
