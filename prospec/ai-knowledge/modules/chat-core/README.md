# chat-core
> Pinia store, fuzzy matcher service, and shared TypeScript types.

<!-- prospec:auto-start -->
## Key Files
| File | Role |
|------|------|
| `src/stores/chat.ts` | Pinia store — turn history, streaming, thinking state |
| `src/services/matcher.ts` | Fuse.js fuzzy match → AsyncIterable stream |
| `src/types/chat.ts` | Shared interfaces: `Message`, `ConversationTurn`, `MockResponse` |
| `src/tests/chat-store.spec.ts` | Store integration tests with mocked matcher |
| `src/tests/matcher.spec.ts` | Matcher unit tests |

## Public API
**useChatStore()** — Pinia store
- `turns: Ref<ConversationTurn[]>` — full conversation history
- `isThinking: Ref<boolean>` — true while stream is in flight
- `pendingInput: Ref<string>` — pre-filled composer value (from hint select)
- `sendMessage(text, imageUrl?)` — pushes turn, awaits stream, sets `isThinking=false` on end
- `fillComposer(text)` — sets `pendingInput`
- `clearHistory()` — resets all state
- `markThinkingDone()` — public API; currently unused internally (kept for future SSE error recovery)

**match(input)** — `src/services/matcher.ts`
- Returns `Promise<{ stream: AsyncIterable<string>, suggestedQuestion: string | null }>`
- Lazy-initializes Fuse index from `mockDataService.getAll()`
- Falls back to `FALLBACK_CONTENT` stream when input is empty, no match, or score > threshold (0.6)

**Types** — `src/types/chat.ts`
- `Message` — `{ id, role, content, timestamp, imageUrl? }`
- `ConversationTurn` — `{ user: Message, assistant: Message, suggestedQuestion: string | null }`
- `MockResponse` — `{ content, suggestedQuestion: string | null }`

## Dependencies
- **depends_on**: `utils` (mockDataService, createMockStream)
- **used_by**: `chat-ui` (IndexPage via useChatStore)

## Modification Guide
**To swap in a real SSE API**:
1. Replace `createMockStream(response.content)` in `matcher.ts` with a real `EventSource` adapter returning `AsyncIterable<string>`.
2. No changes needed in `chat.ts` store — it already uses `for await`.

**To add a new store action** (e.g. retry last message):
1. Add function inside `defineStore` callback.
2. Include it in the `return` object.
3. Add test in `chat-store.spec.ts` with mocked `match`.

## Ripple Effects
- Changing `match()` return type → breaks store's `for await` destructure
- Removing `isThinking` → ThinkingBubble and send-button disabled state both break
- Changing `suggestedQuestion` field name → IndexPage conditional render breaks

## Pitfalls
- `sendMessage` uses `Promise.all([match(), minDelay])` — ensures minimum 1500ms thinking indicator regardless of match speed
- `turn.assistant.content` is mutated via `+=` inside `for await` — Vue 3 tracks deep nested reactive mutations correctly
- Fuse index is lazy and singleton — calling `clearHistory()` does NOT reset the Fuse index (intentional)
<!-- prospec:auto-end -->
<!-- prospec:user-start -->
<!-- prospec:user-end -->
