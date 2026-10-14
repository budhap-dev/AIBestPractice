# Progress
Phase: 1–4 done (PR 1). Next: phase 5 polish + phase 6 docs (PR 2).

## Done
- Vite + React + TS scaffold, theming (system/light/dark), sticky nav, mobile drawer, search, print cheat sheet.
- Content in src/content/*.json, verified against official docs on 2026-10-14 (89/94 facts confirmed).
- Interactive: context meter (per-token cost), quiz, prompt builder, daily checklist, copy buttons.

## Decisions
- Billing is AI credits per token since June 2026; premium requests are legacy. Meter shows cost per model call on the whole window.
- Edit mode is deprecated: modes are Ask / Plan / Agent.
- @workspace and suggestion cycling flagged verify: true.

## Next
- Accessibility + responsive pass at 360/768/1280; README; VERIFY.md.
