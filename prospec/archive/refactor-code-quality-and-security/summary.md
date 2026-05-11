# Summary：refactor-code-quality-and-security

**Archived:** 2026-05-11
**Verification Grade:** A (52/52 tests passing)
**Tasks Completed:** 15/15 (100%)

## What Was Built

A comprehensive code quality and security overhaul addressing four problem categories in one coordinated change:

1. **Project structure & Vue idioms** — Migrated non-API utilities out of `services/` into a new `src/utils/` directory. Replaced a callback ref with Vue 3.5 `useTemplateRef`. Replaced an `animation restart` workaround with standard `<Transition>`. Deleted all Quasar scaffold leftover files.

2. **XSS elimination** — Removed all `v-html` usages from `ChatBubble.vue` and `TypewriterText.vue`. Built `MarkdownRenderer.ts` (a DOM render-function component) using the `streaming-markdown` library with custom `add_token`/`set_attr`/`add_text` interceptors. URL scheme whitelist (`/^https?:\/\//i`) degrades `javascript:` and `data:` URLs to plain text spans.

3. **Streaming architecture** — Replaced the timer-driven typewriter pattern with a proper `AsyncIterable<string>` interface. `matcher.ts` now returns `{ stream, suggestedQuestion }`. The Pinia store consumes the stream via `for await`, updating `turn.assistant.content` per chunk.

4. **Partial link rendering** — During streaming, incomplete markdown links `[text` are shown as a plain `<span>` immediately (link text visible, no raw `[`). Once the full `[text](url)` arrives, the span is replaced by a real `<a>` element.

## Requirements Implemented

| REQ ID | Feature | Description | Status |
|--------|---------|-------------|--------|
| REQ-STRUCT-001 | code-quality | src/utils/ folder + mock-data migration | ADDED |
| REQ-STRUCT-002 | code-quality | Delete Quasar scaffold leftovers | ADDED |
| REQ-CHAT-COMPOSER-001 | code-quality | useTemplateRef + semantic naming | ADDED |
| REQ-INDEX-PAGE-001 | code-quality | Vue Transition replace animation hack | ADDED |
| REQ-MD-RENDERER-001 | xss-prevention | MarkdownRenderer component (no v-html) | ADDED |
| REQ-MD-RENDERER-002 | xss-prevention | URL whitelist + rel="noopener noreferrer" | ADDED |
| REQ-STREAM-001 | sse-streaming | mock-stream AsyncGenerator | ADDED |
| REQ-STREAM-002 | sse-streaming | matcher returns AsyncIterable stream | ADDED |
| REQ-STORE-SEND-001 | sse-streaming | sendMessage for-await stream consumption | MODIFIED |
| REQ-TYPEWRITER-001 | sse-streaming | TypewriterText streaming prop (no timer) | MODIFIED |
| REQ-CHAT-BUBBLE-001 | xss-prevention | ChatBubble de-v-html + animate watch | MODIFIED |
| REQ-MARKDOWN-PARSER-EXPORT | — | Remove markdown-parser.ts (replaced by library) | REMOVED |
| REQ-SCAFFOLD-PAGES | — | Remove ColorsPage/TypographyPage routes | REMOVED |

## Key Design Decisions

- **`streaming-markdown` over `marked`**: The library's incremental DOM parser handles all partial-safe rendering natively, eliminating the need for hand-written `findSafeEnd`/`stripIncompleteTail` logic.
- **ZWSP trigger for list items**: When streaming reaches a list prefix (`- `), a U+200B zero-width space is written to force `add_list_item` to materialize the new `<li>` before the pending link span is appended. The ZWSP is suppressed via an `add_text` interceptor before reaching the DOM.
- **Pending link pattern**: `writeChunk` detects incomplete `[text...` and inserts a `<span>` at the correct DOM position. `resolveOrUpdatePendingLink` upgrades it to an `<a>` when the full URL arrives.
- **$white SCSS token**: Added `$white: #fff` to `quasar.variables.scss`; replaced all bare `#fff` hex literals in 5 component files to comply with CSS token conventions.

## Affected Modules

- `src/components/MarkdownRenderer.ts` — new
- `src/components/LinkTooltip.vue` — CSS token fix
- `src/components/ChatBubble.vue` — v-html removal, tooltip wiring
- `src/components/TypewriterText.vue` — timer removal, streaming prop
- `src/components/ChatComposer.vue` — useTemplateRef, CSS token fix
- `src/components/ChatHeader.vue` — CSS token fix
- `src/components/Launcher.vue` — CSS token fix
- `src/pages/IndexPage.vue` — Transition refactor, CSS token fix
- `src/stores/chat.ts` — for-await streaming
- `src/services/matcher.ts` — AsyncIterable return type
- `src/utils/mock-data.ts` — migrated from services/
- `src/utils/mock-stream.ts` — new
- `src/tests/markdown-parser.spec.ts` — rewritten as MarkdownRenderer tests
- `src/css/quasar.variables.scss` — $white token added
