# Former Netlify deployment (note)

Before moving to GitHub Pages, this site was deployed to **Netlify** for an early
preview. The Netlify config (`netlify.toml`) and Makefile targets have since been
removed from the repo — but the deployment itself may **still be live** as an
external resource, so it's recorded here.

- **URL:** https://wiener-bluut.netlify.app
- **Admin:** https://app.netlify.com/projects/wiener-bluut
- **Team:** `mcp`
- **Project name:** `wiener-bluut`
- **Nature:** manual CLI deploy (`netlify deploy --prod`), **not** git-connected —
  so it serves whatever was last pushed by hand and is now **stale**.

If it's no longer wanted online, remove it from the Netlify dashboard (or
`netlify sites:delete wiener-bluut`). Kept as a note so this outside resource
isn't forgotten.
