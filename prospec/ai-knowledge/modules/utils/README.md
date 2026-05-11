# utils
> Side-effect-free utilities: mock data service and SSE-compatible stream factory.

<!-- prospec:auto-start -->
## Key Files
| File | Role |
|------|------|
| `src/utils/mock-data.ts` | `MockDataService` — lazy loads and caches mock JSON |
| `src/utils/mock-stream.ts` | `createMockStream` — async generator simulating SSE chunks |
| `src/mock/messages.js` | Raw mock data map (read-only; never import from `.vue`) |
| `src/types/chat.ts` | `MockResponse` interface used by mock-data |

## Public API
- `mockDataService.getAll()` — `Promise<Record<string, MockResponse>>`; lazy-loads `messages.js` and caches; parses `suggestedQuestion` from `"Suggested Question:"` suffix
- `createMockStream(content: string)` — `AsyncGenerator<string>`; yields 3-char chunks with 22ms delay; concatenated output equals input exactly

## Dependencies
- **depends_on**: `src/mock/messages.js` (raw JSON, loaded via dynamic import)
- **used_by**: `chat-core` (matcher.ts consumes both)

## Modification Guide
**To change chunk size or delay** (e.g. faster tests):
1. Edit `CHUNK_SIZE` and `DELAY_MS` constants in `mock-stream.ts`.

**To add a new mock response**:
1. Add entry to `src/mock/messages.js` `MESSAGE_MOCK_MAP`.
2. If a suggested question is needed, append `"Suggested Question: ..."` to the content string.
3. No code changes required — `parseEntry` handles it automatically.

**To replace mock data with real API**:
1. Replace `createMockStream` call in `matcher.ts` with a real EventSource adapter.
2. `mock-data.ts` and `mock-stream.ts` become unused — remove after migration.

## Ripple Effects
- Changing `MockResponse` shape → breaks `matcher.ts` and `chat.ts` store
- Changing `SUGGESTED_QUESTION_PREFIX` constant → existing mock entries stop parsing `suggestedQuestion`

## Pitfalls
- `MockDataService` uses a private `cache` — unit tests that need fresh data must instantiate a new `MockDataService()` rather than using the singleton `mockDataService`
- Dynamic `import('src/mock/messages.js')` requires Vite/Quasar alias resolution — do not use relative paths
<!-- prospec:auto-end -->
<!-- prospec:user-start -->
<!-- prospec:user-end -->
