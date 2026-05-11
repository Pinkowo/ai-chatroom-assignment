# md-renderer
> Streaming-safe markdown-to-DOM renderer; the only place allowed to touch innerHTML.

<!-- prospec:auto-start -->
## Key Files
| File | Role |
|------|------|
| `src/components/MarkdownRenderer.ts` | Core component — `defineComponent` + DOM render function |
| `src/tests/markdown-parser.spec.ts` | 52 tests covering bold, links, XSS, partial streaming |

## Public API
- `MarkdownRenderer` — `defineComponent`, props: `content: string`, `partial?: boolean`
  - `partial=true` → streaming mode: parser stays open, accumulates chunks
  - `partial=false` → finalizes parser on mount; static render
- `createSafeRenderer(el)` — internal; returns `[renderer, getLeafNode, enableZwspSuppression]`
- `findPartialLinkStart(text)` — internal; finds first incomplete `[text...` in a string
- `safeImageCutoff(text)` — internal; holds back incomplete `![...](url)` from DOM

## Dependencies
- **depends_on**: `streaming-markdown` (smd) — incremental DOM parser
- **depends_on**: none from internal modules
- **used_by**: `chat-rendering` (ChatBubble, TypewriterText via `:content` prop)

## Modification Guide
**To add a new inline token style** (e.g. italic → `.em`):
1. In `createSafeRenderer`, extend `renderer.add_token` — check `type === smd.EM_AST` etc.
2. Add CSS in ChatBubble `.ai-response :deep(.em)`.
3. Add a test case in `markdown-parser.spec.ts`.

**To change link security rules**:
1. Edit `SAFE_URL_RE` constant (currently `/^https?:\/\//i`).
2. Update `renderer.set_attr` interceptor — the unsafe path swaps `<a>` → `<span>`.
3. Add test for new allowed/blocked scheme.

## Ripple Effects
- Changing `ZWSP` value or suppression logic → breaks list-item link positioning (tests in spec)
- Changing `pendingLinkEl` / `pendingWrapperEl` DOM insertion → breaks partial streaming tests
- Removing `data-tooltip` from links → breaks `LinkTooltip` in `ChatBubble`

## Pitfalls
- `data.index > 0` check in `getLeafNode` is a live query on `renderer.data` — never cache the result
- `streaming-markdown` fires `add_list_item` only on **first content char after "- "**, not on the prefix itself; use ZWSP trigger to materialize `<li>` before appending pending spans
- `enableZwspSuppression()` is one-shot — call it immediately before writing ZWSP
<!-- prospec:auto-end -->
<!-- prospec:user-start -->
<!-- prospec:user-end -->
