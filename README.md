# Nitra AI Chat Widget

A floating AI chat widget built with Quasar + Vue 3.

**[Live Demo](https://pinkowo.github.io/ai-chatroom-assignment)**

## Features

- Typewriter streaming effect for AI responses
- Markdown rendering — users see formatted text, never raw `**syntax**`
- Image attachment with preview and 5 MB validation
- Smart auto-scroll — locks when scrolling up, resumes at bottom
- Rotating hint carousel with suggested questions
- Responsive layout (desktop panel → full-viewport on mobile)
- Link tooltips — hover shows the URL before clicking

## UX Optimizations

**Markdown rendering** — AI responses are parsed to HTML so users see bold, lists, and links instead of raw syntax.

**Image attachment** — File picker with thumbnail preview before send. 5 MB guard with error message. Object URL lifecycle managed (`createObjectURL` / `revokeObjectURL`) to prevent memory leaks.

**Responsive layout** — `780 × 591 px` floating panel on desktop, full-viewport on screens narrower than 840 px.

**Smart auto-scroll** — Scroll loop runs on every animation frame during streaming. Wheel `deltaY < 0` locks auto-scroll so users can read earlier messages; scrolling back within 20 px of the bottom re-enables it.

**Link tooltips** — Hovering a link in any AI response shows the URL in a tooltip before the user clicks, so they know where they're going.

## Tech Stack

|                 |                                                    |
| --------------- | -------------------------------------------------- |
| Framework       | [Quasar](https://quasar.dev/) (Vue 3) + TypeScript |
| State           | Pinia                                              |
| Testing         | Vitest + @vue/test-utils                           |
| Package Manager | pnpm                                               |

## Getting Started

```bash
pnpm install
pnpm dev    # http://localhost:9000
pnpm test
```

## Tests

5 suites covering store logic, image attachment, fuzzy matching, markdown parsing, and hint carousel.

```bash
pnpm test
```

## Development Workflow

Planned with [Prospec](https://github.com/ci-yang/prospec) — a structured AI planning workflow:

```
/prospec-new-story → define user story with acceptance criteria
/prospec-plan      → create implementation plan + delta-spec
/prospec-tasks     → break plan into architecture-layered task checklist
/prospec-ff        → generate story + plan + tasks in one pass
/prospec-design    → extract design spec from design tool
/prospec-implement → execute tasks in order
/prospec-verify    → audit against spec and Constitution
/prospec-archive   → move completed change to archive
```

Archived changes:

**build-ai-chatroom-mvp** — [story](prospec/archive/build-ai-chatroom-mvp/proposal.md) · [plan](prospec/archive/build-ai-chatroom-mvp/plan.md) · [tasks](prospec/archive/build-ai-chatroom-mvp/tasks.md) · [design-spec](prospec/archive/build-ai-chatroom-mvp/design-spec.md) · [interaction-spec](prospec/archive/build-ai-chatroom-mvp/interaction-spec.md)

**mock-image-upload** — [story](prospec/archive/mock-image-upload/proposal.md) · [plan](prospec/archive/mock-image-upload/plan.md) · [tasks](prospec/archive/mock-image-upload/tasks.md)
