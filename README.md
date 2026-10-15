# Copilot Field Guide

A static web app that teaches everyday GitHub Copilot habits in VS Code: keeping the context focused, spending AI credits wisely, choosing the right chat mode, writing prompts that land, and reviewing everything before it ships.

It works as a live demo for a team session and as a reference people keep open next to their editor.

## Who it's for

- **End users:** ASDA developers who use GitHub Copilot in VS Code, from first-week users to daily power users. They keep the guide open next to their editor as an everyday reference.
- **Demo audience:** ASDA engineering teams in a live session: developers, tech leads and engineering managers with mixed Copilot experience.

Both lines show on the home page, and the demo audience shows on the first slide. Edit them in `src/content/meta.json`.

## What's inside

Each section has its own page, with previous and next links at the bottom. Pages use hash URLs such as `#/cheat-sheet` or `#/cheat-sheet/cmd-compact` for a single item, so links can be shared and old `#cmd-compact` links still work.

| Section | What it covers |
|---|---|
| Key terms | Plain-English definitions for people new to AI (context, token, agent…), each with an everyday comparison, and an animated **what happens when you press Enter** diagram. Every other page links the terms its intro uses. |
| Mental model | What fills the context window, and why every prompt re-sends (and re-bills) all of it. Includes the interactive **context meter**. |
| Prompt cost | Animated diagrams of the same bug fixed with a vague prompt and a focused one, showing how re-sent history snowballs, plus the anatomy of a good prompt. |
| Chat modes | Ask, Plan and Agent, and when to use each, with a cost staircase diagram. Edit is deprecated. |
| Cheat sheet | Slash commands, `#` context, `@` participants, shortcuts (macOS / Windows), context and model settings. |
| Daily workflow | A seven-step routine, a "when the chat gets long" decision guide and a daily checklist. |
| Do's and don'ts | Grouped by context & cost, prompting, reviewing and security, each with a one-line why. |
| Team memory | Instruction files, prompt files, custom agents, AGENTS.md and skills, with example files. |
| Prompt templates | Copyable prompts plus a **prompt builder**. |
| Test yourself | A scenario quiz. |
| Security | Approvals, auto-approve, sandboxing, content exclusion and public code. |
| Beyond the editor | Commit messages, terminal chat, smart actions, PR review and the cloud agent. |
| Wrap-up | Seven takeaways, each linking back to its section. |

Most sections end with **Did you know?** facts, each with a docs link. Small wins get confetti: a right quiz answer, a finished checklist and the end of the deck. Confetti and diagram animations are off when the system asks for reduced motion.

## Presenter mode

Select **Present** in the top bar, or **Present the guide** on the home page, to run the guide as a slide deck. Starting from a section page opens the deck at that section. The deck is built from the same content files, so it stays in sync with the guide.

Each press of → reveals the next point on a slide, then moves to the next slide. Quiz slides show the options one by one and reveal the answer last.

| Key | Does |
|---|---|
| → Space PgDn | Next point or slide |
| ← Shift+Space PgUp | Previous point or slide |
| Home / End | First or last slide |
| O | Overview of all slides |
| F | Fullscreen |
| T | Next transition: Slide, Fade, Zoom, Flip, Page turn, Cube, Wipe, Circle, Rise, Random |
| B | Blank the screen |
| ? | Show the shortcuts |
| Esc | Leave presenter mode, back to the current section's page |

Every slide shows an estimated time to read in the bottom bar, with the reading time left in the deck. The overview shows each slide's time and the total, about 36 minutes. Times assume 200 words per minute; change `readingWordsPerMinute` in `meta.json` to suit your audience.

On touch screens, swipe left or right. The toolbar hides after a few seconds without mouse movement. Slide layouts live in `src/presenter/deck.ts`.

## Themes

The palette button in the top bar sets the appearance (system, light or dark) and one of six accent colours: Teal, Ocean, Grape, Rose, Ember and Graphite. Every colour passes WCAG AA contrast in both appearances. The choice is saved in the browser. Colours are defined in `src/styles.css` under "Colour themes".

## Run it

Requires Node 24.

```bash
npm ci
```

```bash
npm run dev
```

Other scripts: `npm run build` (type-check and build to `dist/`), `npm run lint`, `npm run preview`.

## Host it

`npm run build` produces a fully static `dist/` folder with relative paths. Routing uses the URL hash, so the host needs no rewrite rules. Copy it to any internal static host or sub-folder. There's no backend, analytics or external CDN.

## Edit the content

All text lives in typed JSON files in [`src/content/`](src/content). You don't need to touch React to change it.

| File | Holds |
|---|---|
| `meta.json` | Company name, owner, end users, demo audience, reading speed, last-reviewed date, AI policy link |
| `sections.json` | Section order, nav labels, titles and intros |
| `context.json`, `modes.json`, `commands.json` | Mental model cards, chat modes, cheat sheet rows |
| `workflow.json` | Workflow steps, long-chat decisions, checklist items |
| `rules.json` | Do's and don'ts |
| `memory.json`, `templates.json` | Team memory files and prompt templates |
| `quiz.json`, `meter.json` | Quiz scenarios and the context meter's actions and models |
| `security.json`, `beyond.json` | Security and beyond-the-editor cards |
| `glossary.json` | Key terms: definition, everyday comparison, and the words that link a page to each term |
| `promptCost.json` | The vague and focused prompt scenarios (illustrative token counts) and the prompt anatomy |
| `diagrams.json` | Text for the request flow, modes staircase, long-chat flowchart and team memory diagrams |
| `facts.json` | Did you know? facts, each tied to a section and a source |
| `summary.json` | Wrap-up takeaways |

Every item can carry:

- `sourceUrl`: link to the official doc that backs the claim (shown as "Source").
- `verify: true`: shows a "Needs verification" badge. Add the item to [VERIFY.md](VERIFY.md).

The types in [`src/content/types.ts`](src/content/types.ts) catch missing fields at build time.

### Before a demo

1. Fill in `company`, `owner` and `policyUrl` in `meta.json`.
2. Re-check [VERIFY.md](VERIFY.md). Copilot changes monthly.
3. Update `lastReviewed`.

## How this was built

[PROMPTS.md](PROMPTS.md) holds the phase-by-phase prompts for building this with Copilot Agent mode, using the same habits the guide teaches. [docs/SPEC.md](docs/SPEC.md) is the spec, and [docs/PROGRESS.md](docs/PROGRESS.md) carries state between chats.
