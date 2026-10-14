# Copilot Field Guide

A static web app that teaches everyday GitHub Copilot habits in VS Code: keeping the context focused, spending AI credits wisely, choosing the right chat mode, writing prompts that land, and reviewing everything before it ships.

It works as a live demo for a team session and as a reference people keep open next to their editor.

## What's inside

| Section | What it covers |
|---|---|
| Mental model | What fills the context window, and why every prompt re-sends (and re-bills) all of it. Includes the interactive **context meter**. |
| Chat modes | Ask, Plan and Agent, and when to use each. Edit is deprecated. |
| Cheat sheet | Slash commands, `#` context, `@` participants, shortcuts (macOS / Windows), context and model settings. |
| Daily workflow | A seven-step routine, a "when the chat gets long" decision guide and a daily checklist. |
| Do's and don'ts | Grouped by context & cost, prompting, reviewing and security, each with a one-line why. |
| Team memory | Instruction files, prompt files, custom agents, AGENTS.md and skills, with example files. |
| Prompt templates | Copyable prompts plus a **prompt builder**. |
| Test yourself | A scenario quiz. |
| Security | Approvals, auto-approve, sandboxing, content exclusion and public code. |
| Beyond the editor | Commit messages, terminal chat, smart actions, PR review and the cloud agent. |

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

`npm run build` produces a fully static `dist/` folder with relative paths. Copy it to any internal static host or sub-folder. There's no backend, analytics or external CDN.

## Edit the content

All text lives in typed JSON files in [`src/content/`](src/content). You don't need to touch React to change it.

| File | Holds |
|---|---|
| `meta.json` | Company name, owner, last-reviewed date, AI policy link |
| `sections.json` | Section order, nav labels, titles and intros |
| `context.json`, `modes.json`, `commands.json` | Mental model cards, chat modes, cheat sheet rows |
| `workflow.json` | Workflow steps, long-chat decisions, checklist items |
| `rules.json` | Do's and don'ts |
| `memory.json`, `templates.json` | Team memory files and prompt templates |
| `quiz.json`, `meter.json` | Quiz scenarios and the context meter's actions and models |
| `security.json`, `beyond.json` | Security and beyond-the-editor cards |

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
