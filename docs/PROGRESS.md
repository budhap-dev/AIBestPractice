# Progress
Phase: all phases done (PR 1 app, PR 2 polish + docs).

## Done
- Vite + React + TS scaffold, theming (system/light/dark), sticky nav, mobile drawer, search, print cheat sheet.
- Content in src/content/*.json, verified against official docs on 2026-10-14 (89/94 facts confirmed).
- Interactive: context meter (per-token cost), quiz, prompt builder, daily checklist, copy buttons.
- Responsive pass at 375/768/1280 in light and dark; README; VERIFY.md.

## Decisions
- Audience (endUsers, demoAudience) and readingWordsPerMinute live in meta.json; slide read time = words shown when fully revealed / wpm, rounded up to 5 s.
- Presenter mode (#/present/n): deck built from content in src/presenter/deck.ts; fragments reveal per key press; 4 slide transitions.
- Themes: appearance + 6 accent palettes via data-palette and light-dark(); circular view-transition reveal.
- One page per section with hash routing (#/section/item); legacy #id links redirect. Print view renders cheat sheet + do's and don'ts.
- Billing is AI credits per token since June 2026; premium requests are legacy. Meter shows cost per model call on the whole window.
- Edit mode is deprecated: modes are Ask / Plan / Agent.
- @workspace and suggestion cycling flagged verify: true (see VERIFY.md).

- Oct 2026: Key terms section + glossary links on every page; Prompt cost section; animated diagrams (request flow, snowball, prompt anatomy, modes, chat flow, team memory) on pages and as deck slides; Did you know? facts (sourced, checked 15 Oct 2026); Wrap-up section; confetti for quiz, checklist and deck end; Random transition.
- Diagram series colours (--dg-1..5) come from a CVD-validated categorical palette, stepped for dark; text stays in text colours.

## Next
- Fill company, owner and policy link in src/content/meta.json.
- Check the print cheat sheet in a real browser print preview.
