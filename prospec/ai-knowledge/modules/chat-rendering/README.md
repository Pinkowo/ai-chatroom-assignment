# chat-rendering
> Components that display AI messages: bubble, typewriter animation, and link tooltip.

<!-- prospec:auto-start -->
## Key Files
| File | Role |
|------|------|
| `src/components/ChatBubble.vue` | Renders one turn's AI or user message; wires tooltip events |
| `src/components/TypewriterText.vue` | Animates AI text; delegates to MarkdownRenderer |
| `src/components/LinkTooltip.vue` | Fixed-position tooltip shown on link hover; teleported to `<body>` |

## Public API
**ChatBubble** — props: `role`, `content`, `animate?`, `streaming?`; emits: `animationDone`
- `animate=true + streaming=true` → `TypewriterText` with live SSE content
- `animate=true + streaming=false` → `TypewriterText` timer mode (suggested question)
- `animate=false` → static `MarkdownRenderer`
- Tooltip wired via `@mousemove` / `@mouseleave` on `.msg__bubble`

**TypewriterText** — props: `content`, `streaming?`; emits: `done`
- `streaming=true` → pass-through to `<MarkdownRenderer :partial="true">` (no timer)
- `streaming=false` → 22ms/1-char timer; skips trailing `\n` and mid-URL positions; emits `done`

**LinkTooltip** — props: `text`, `anchorEl`, `visible`; no emits
- Positions above anchor by default; flips below if too close to top of viewport

## Dependencies
- **depends_on**: `md-renderer` (MarkdownRenderer)
- **used_by**: `chat-ui` (IndexPage, ChatBubble used directly in IndexPage template)

## Modification Guide
**To add a new bubble style** (e.g. error state):
1. Add new `:class` binding in `ChatBubble.vue` template.
2. Add SCSS rule under `.msg__bubble--error` in scoped styles.

**To change animation speed**:
1. `TypewriterText.vue`: edit `CHARS_PER_TICK` or `TICK_MS` constants.

**To change tooltip appearance**:
1. Edit `.link-tooltip` in `LinkTooltip.vue` — uses `$white` SCSS token for color.

## Ripple Effects
- Removing `data-tooltip` attribute from links in `md-renderer` → tooltip never shows
- Changing `animationDone` emit timing → `suggestedQuestion` bubble may appear too early/late

## Pitfalls
- `watch(animate, (val, old) => { if (old && !val) emit('animationDone') })` in ChatBubble handles `streaming=true` mode where TypewriterText never fires `done`
- `LinkTooltip` uses `position: fixed` + `Teleport to="body"` — z-index 9999; must stay above Quasar modals
- SCSS `$white` required in `LinkTooltip` — never use bare `#fff`
<!-- prospec:auto-end -->
<!-- prospec:user-start -->
<!-- prospec:user-end -->
