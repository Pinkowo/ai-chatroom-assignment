---
feature: sse-streaming
title: SSE-Compatible Streaming Architecture
status: active
story_count: 1
req_count: 4
last_updated: 2026-05-11
---

# Feature: SSE-Compatible Streaming Architecture

## Overview

Replaces the timer-driven typewriter animation with a true `AsyncIterable<string>` streaming interface. The Pinia store consumes streams via `for await`, updating reactive state per chunk. Switching to a real SSE `EventSource` requires only replacing the stream source.

---

## US-4: SSE-Compatible Streaming + mock-data Refactor

As a 開發者,
I want `TypewriterText` 以響應式 prop 驅動取代計時器、mock-data 改為 `AsyncIterable` 輸出、store 以 `for await` 逐 chunk 累加,
So that 未來切換真實 SSE API 只需替換 stream 來源，隱藏 markdown syntax 的 typewriter 效果自動保留.

**Priority:** P1
**Acceptance Scenarios:**
- WHEN AI 回覆串流中, THEN 使用者看到文字逐漸出現，markdown syntax（`**`、`[`）從不以原始字元顯示
- WHEN 串流結束, THEN AI 回覆完整顯示，Suggested Question 泡泡依序出現
- WHEN 查看 `src/utils/mock-stream.ts`, THEN 存在 `createMockStream(content): AsyncIterable<string>`
- WHEN 查看 `chat.ts` store, THEN `sendMessage` 以 `for await` 消費串流，每 chunk 更新 `turn.assistant.content`
- WHEN 替換 `createMockStream` 為真實 `EventSource`, THEN 不需修改 store 或 TypewriterText 邏輯

### REQ-STREAM-001: mock-stream AsyncGenerator

**Description:** 建立 `src/utils/mock-stream.ts`，提供 `createMockStream(content)` 模擬 SSE 節奏的 AsyncGenerator，未來可替換為真實 `EventSource`。

**Acceptance Criteria:**
1. `createMockStream(content)` 回傳 `AsyncGenerator<string>`
2. 以固定 chunk size（約 3 字元）yield 內容，每 chunk 之間有 delay（約 22ms）
3. 所有 chunk 串接後等於原始 `content`，無遺漏

**Priority:** High | **Status:** Implemented (2026-05-11)

---

### REQ-STREAM-002: matcher 回傳 AsyncIterable 串流

**Description:** `matcher.ts` 的 `match()` 改回傳 `{ stream: AsyncIterable<string>, suggestedQuestion: string | null }`，store 透過此介面消費串流；此介面設計相容真實 SSE EventSource。

**Acceptance Criteria:**
1. `match()` 回傳型別為 `Promise<{ stream: AsyncIterable<string>, suggestedQuestion: string | null }>`
2. `suggestedQuestion` 在串流開始前即可取得（upfront 解析）
3. 未匹配輸入時，`stream` 仍為合法 AsyncIterable（yield fallback 回覆）

**Priority:** High | **Status:** Implemented (2026-05-11)

---

### REQ-STORE-SEND-001: sendMessage 改為串流消費

**Description:** `sendMessage` 以 `for await` 消費 `match()` 回傳的 `AsyncIterable<string>`，每 chunk 累加至 `turn.assistant.content`。

**Before:** `sendMessage` 呼叫 `match(text)` 取得完整 `MatchResult`，一次性設定 `turn.assistant.content`，`isThinking` 由 TypewriterText emit `done` 後才設為 false.

**After:** `sendMessage` 以 `for await` 消費 `AsyncIterable<string>`，每 chunk 累加至 `turn.assistant.content`。串流結束後直接 `isThinking.value = false`.

**Priority:** High | **Status:** Implemented (2026-05-11)

---

### REQ-TYPEWRITER-001: TypewriterText 去計時器化

**Description:** `TypewriterText.vue` 新增 `streaming?: boolean` prop。`streaming=true` 時直接渲染 `<MarkdownRenderer :partial="true" />`，SSE 串流節奏即為動畫節奏。`streaming=false` 保留 timer 逐字推進（用於 suggested question typewriter 效果）。

**Before:** 接收完整 `content`，以 `setTimeout(tick, 22ms)` 計時器逐字推進 `position`，emit `done`.

**After:** `streaming=true` → `<MarkdownRenderer :content="props.content" :partial="true" />`；`streaming=false` → timer 逐字推進 `visibleContent`；`done` emit 改由 ChatBubble `watch(animate)` 偵測取代.

**Priority:** High | **Status:** Implemented (2026-05-11)

---

## Change History

| Date | Change | REQs Affected |
|------|--------|---------------|
| 2026-05-11 | Initial — refactor-code-quality-and-security | REQ-STREAM-001, REQ-STREAM-002, REQ-STORE-SEND-001, REQ-TYPEWRITER-001 |
