# docs/

How documentation is managed here, so docs don't go stale or add git noise.

## Three kinds of docs, by lifecycle

1. **Frozen snapshots** — dated, written once, **never edited** afterwards. They
   can't go stale because they only ever claimed to describe a moment in time.
   They live in `docs/` with a date in the header.
2. **Living docs** — describe the *current intended state* and are kept in sync
   (or deleted). Keep these few and short. Prefer **append-only** logs (e.g. a
   future `docs/decisions.md` you only add dated lines to) so diffs stay small.
3. **Lifecycle items** — open questions, TODOs, review findings. These have state
   (open → done) and belong in **GitHub Issues**, not files. A stale issue is
   visibly open; a stale notes file silently misleads.

Rule of thumb: the trap is the middle — a medium-length "notes" file that looks
current but nobody maintains. Push those to issues, or freeze-and-date them.

## Current contents

- **`handoff.md`** — design handoff / spec from the online design session.
  **Frozen snapshot, 2026-06-01.** Canonical description of the intended look;
  not maintained as the code evolves.
