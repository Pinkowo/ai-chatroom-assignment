---
title: Nitra AI Chatroom — Product Spec
last_updated: 2026-05-11
feature_count: 5
---

# Nitra AI Chatroom — Product Spec

## Product Overview

A floating AI chat widget embedded in a web page. Users type questions, receive fuzzy-matched markdown responses with typewriter animation, and can upload images. The architecture is designed for SSE streaming and XSS-safe markdown rendering.

---

## Feature Map

| Feature | Status | Stories | Reqs |
|---------|--------|---------|------|
| [chat-core](features/chat-core.md) | active | 1 | 2 |
| [chat-rendering](features/chat-rendering.md) | active | 1 | 2+ |
| [chat-ui](features/chat-ui.md) | active | 1 | 2+ |
| [code-quality](features/code-quality.md) | active | 2 | 4 |
| [xss-prevention](features/xss-prevention.md) | active | 1 | 3 |
| [sse-streaming](features/sse-streaming.md) | active | 1 | 4 |

---

## Core Stories (P0/P1)

### Chat Core
- **US-1** (chat-core): As a 開發者, I want mock data encapsulated in a typed service and fuzzy-matched via Fuse.js, so that the interface is ready to swap in a real API.

### Chat Rendering
- **US-2** (chat-rendering): As a 使用者, I want AI responses to appear with typewriter animation and markdown formatting, so that the experience feels dynamic and readable.

### XSS Prevention
- **US-3** (xss-prevention): As a 開發者, I want v-html eliminated and markdown rendered via a safe DOM component, so that `javascript:` injection and XSS attacks are structurally impossible.

### SSE Streaming
- **US-4** (sse-streaming): As a 開發者, I want `TypewriterText` driven by reactive props and the store consuming `AsyncIterable<string>`, so that switching to real SSE requires only replacing the stream source.

### Code Quality
- **US-1** (code-quality): As a 開發者, I want services/ to contain only API clients, Vue 3 idioms used correctly, and scaffold leftovers removed, so that the codebase is clear and IDE error-free.
- **US-2** (code-quality): As a 開發者, I want `<Transition>` to manage the chat panel open/close animation, so that animation restart hacks are eliminated.

### Image Upload
- As a 使用者, I want to attach an image to my message, so that I can share visual context with the AI.

---

## Architecture Notes

- **Streaming**: `matcher.ts` → `{ stream: AsyncIterable<string>, suggestedQuestion }` → Pinia `for await` → reactive `turn.assistant.content`
- **Markdown**: `streaming-markdown` library with custom interceptors in `MarkdownRenderer.ts`; no `v-html` anywhere
- **Pending links**: During streaming, `[text...` renders as a `<span>` immediately; upgrades to `<a>` on full URL arrival
- **CSS tokens**: All white values use `$white` SCSS variable; no bare `#fff` hex literals

---

## Change History

| Date | Change | Impact |
|------|--------|--------|
| 2026-04-23 | build-ai-chatroom-mvp | Core chat widget, typewriter, fuzzy match |
| 2026-04-24 | mock-image-upload | Image attachment in composer |
| 2026-05-11 | refactor-code-quality-and-security | XSS elimination, SSE streaming, Vue idioms, CSS tokens |
