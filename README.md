# AI Chatroom Assignment

A floating AI chat widget built with Quasar + Vue 3, featuring typewriter streaming, image attachment, and responsive layout.

## Tech Stack

- **Framework**: [Quasar](https://quasar.dev/) (Vue 3)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **State Management**: Pinia
- **Testing**: Vitest + @vue/test-utils
- **Icons**: Font Awesome 6

## Development Workflow

### Planning — Prospec

Feature planning followed the [Prospec](https://github.com/ci-yang/prospec) workflow:

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

Completed changes are archived under `prospec/archive/`:

**build-ai-chatroom-mvp** — [story](prospec/archive/build-ai-chatroom-mvp/proposal.md) · [plan](prospec/archive/build-ai-chatroom-mvp/plan.md) · [tasks](prospec/archive/build-ai-chatroom-mvp/tasks.md) · [design-spec](prospec/archive/build-ai-chatroom-mvp/design-spec.md) · [interaction-spec](prospec/archive/build-ai-chatroom-mvp/interaction-spec.md)

**mock-image-upload** — [story](prospec/archive/mock-image-upload/proposal.md) · [plan](prospec/archive/mock-image-upload/plan.md) · [tasks](prospec/archive/mock-image-upload/tasks.md)

### Design

UI reference is `design/design.html` — a self-contained HTML file that defines the target visual appearance. Design tokens (colors, font sizes) are defined in `src/css/quasar.variables.scss` and exposed as CSS custom properties in `src/css/tokens.scss`, then consumed across all components via `$token` (SCSS) or `var(--token)` (CSS).

### Implementation

Claude Code was used as the primary development environment — planning, implementing, debugging, and refactoring within a single conversation context.

## Getting Started

```bash
pnpm install
pnpm dev       # http://localhost:9000
pnpm build
pnpm test
```

## UX Features

### Markdown rendering
AI responses are parsed from Markdown to HTML — users see formatted text, bullet lists, and bold/italic, never raw `**syntax**`.

### Image attachment
Users can attach an image (up to 5 MB) alongside their message. A thumbnail preview appears before sending; the image is shown in the user bubble after send. Memory is managed via `URL.createObjectURL` / `revokeObjectURL`.

### Responsive layout
The widget adapts from a `780 × 591 px` floating panel on desktop to a full-viewport panel on screens narrower than 840 px.

### Smart auto-scroll
While the AI streams its response, the chat body scrolls automatically. Scrolling up (wheel `deltaY < 0`) locks auto-scroll so users can read earlier messages; scrolling back within 20 px of the bottom re-enables it.

## Tests

5 test suites, ~460 lines:

| File | What it covers |
|------|----------------|
| `chat-store.spec.ts` | `sendMessage`, `fillComposer`, `clearHistory`, image-only send, duplicate-send guard |
| `chat-composer.spec.ts` | File picker preview, 5 MB validation, clear button, URL revocation |
| `matcher.spec.ts` | Fuzzy match scoring, fallback response, suggested question passthrough |
| `markdown-parser.spec.ts` | Bold, italic, links, numbered lists, `renderPartial` safety |
| `hint-carousel.spec.ts` | Hint rotation, click-to-fill, visibility based on message history |

```bash
pnpm test
```
