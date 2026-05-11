# AI Knowledge Index

<!-- prospec:auto-start -->
## Module Table

| Module | Keywords | Status | Description | Rationale | Depends On |
|--------|----------|--------|-------------|-----------|------------|
| [md-renderer](modules/md-renderer/README.md) | markdown, streaming, XSS, MarkdownRenderer, ZWSP, partial, link, tooltip | active | Streaming-safe markdown-to-DOM renderer using `streaming-markdown` library | Complex incremental parser with custom interceptors deserves its own module | streaming-markdown (external) |
| [chat-rendering](modules/chat-rendering/README.md) | ChatBubble, TypewriterText, LinkTooltip, animation, typewriter, streaming | active | Components that display AI messages with animation and link tooltip | Groups the visual output pipeline: bubble → typewriter → renderer | md-renderer |
| [chat-ui](modules/chat-ui/README.md) | IndexPage, ChatComposer, Launcher, HintCarousel, widget, open, close, scroll | active | Widget shell and chrome components; orchestrates open/close and scroll | Top-of-tree orchestration layer separate from rendering logic | chat-rendering, chat-core |
| [chat-core](modules/chat-core/README.md) | store, Pinia, matcher, Fuse, streaming, AsyncIterable, types, turn | active | Pinia store, fuzzy matcher service, and shared TypeScript types | Separates business logic (matching, state) from UI concerns | utils |
| [utils](modules/utils/README.md) | mock-data, mock-stream, AsyncGenerator, MockDataService, chunk, SSE | active | Side-effect-free utilities: mock data service and stream factory | Pure utilities with no Vue dependencies; swappable for real API | — |

## Loading Rules

| Task | Load |
|------|------|
| Implementing new markdown token style | L1: md-renderer → chat-rendering (for CSS) |
| Debugging streaming rendering | L1: md-renderer (full) |
| Adding composer features | L1: chat-ui |
| Changing store or API interface | L1: chat-core → utils |
| Swapping mock data for real API | L1: utils → chat-core |
| Full widget overview | L1: all 5 modules |
<!-- prospec:auto-end -->
<!-- prospec:user-start -->
<!-- prospec:user-end -->
