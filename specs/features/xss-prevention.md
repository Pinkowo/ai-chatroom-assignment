---
feature: xss-prevention
title: XSS Prevention & Secure Markdown Rendering
status: active
story_count: 1
req_count: 3
last_updated: 2026-05-11
---

# Feature: XSS Prevention & Secure Markdown Rendering

## Overview

Eliminates all `v-html` usages and unsafe URL rendering from the chat UI. Markdown is rendered through a DOM-based component (`MarkdownRenderer.ts`) that enforces a URL scheme whitelist and always sets `rel="noopener noreferrer"` on external links.

---

## US-3: v-html Elimination & Safe Markdown Renderer

As a 開發者,
I want 使用 `streaming-markdown` library 渲染 markdown、徹底移除 `v-html`，
So that 消除 XSS 攻擊面、`javascript:` URL 注入漏洞，且不依賴 DOMPurify 額外套件.

**Priority:** P1
**Acceptance Scenarios:**
- WHEN 查看所有 `.vue` 檔案, THEN 不存在任何 `v-html` 指令
- WHEN markdown content 包含 `[x](javascript:alert(1))`, THEN 渲染為純文字，不產生可點擊連結
- WHEN markdown content 包含 `**bold**`, THEN 渲染為帶 `class="num"` 的元素
- WHEN markdown content 包含 `[text](https://example.com)`, THEN 渲染為帶 `data-tooltip`、`class="link"`、`rel="noopener noreferrer"` 的 `<a>` 元素

### REQ-MD-RENDERER-001: MarkdownRenderer VNode 元件

**Description:** 建立 `src/components/MarkdownRenderer.ts`（render function 元件），以 `streaming-markdown` library + DOM 攔截器將 markdown 渲染為 DOM 節點，徹底移除 `v-html`。

**Acceptance Criteria:**
1. 不存在任何 `v-html` 指令（`TypewriterText.vue`、`ChatBubble.vue` 均已移除）
2. `**bold**` 渲染為帶 `class="num"` 的元素
3. `[text](https://example.com)` 渲染為 `<a class="link" data-tooltip="https://example.com" target="_blank" rel="noopener noreferrer">text</a>`
4. `partial` prop 為 true 時，streaming-markdown 樂觀渲染確保不暴露原始 markdown 符號

**Priority:** High | **Status:** Implemented (2026-05-11)

**Implementation Note:** Uses `streaming-markdown` (DOM renderer) with custom `add_token`/`set_attr`/`add_text` interceptors. Link text appears immediately as a `<span>` during streaming and upgrades to `<a>` once the full URL arrives (pending link pattern). A ZWSP trigger forces list item materialization for correct DOM positioning.

---

### REQ-MD-RENDERER-002: URL scheme 白名單與 rel 完整性

**Description:** 連結渲染加入 URL scheme 驗證，拒絕非 `http(s)://` URL；所有外部連結補齊 `rel="noopener noreferrer"`。

**Acceptance Criteria:**
1. `[x](javascript:alert(1))` 渲染為純文字 `x`，不產生 `<a>` 標籤
2. `[x](data:text/html,<h1>XSS</h1>)` 同上，降級純文字
3. 所有合法外部連結的 `<a>` 標籤包含 `rel="noopener noreferrer"`

**Priority:** High | **Status:** Implemented (2026-05-11)

---

### REQ-CHAT-BUBBLE-001: ChatBubble 去 v-html 化 + 動畫事件

**Description:** 靜態 AI 訊息改用 `<MarkdownRenderer :content="content" />`；動畫完成事件由 `watch(animate)` 偵測 prop 變化替代。

**Before:** 靜態 AI 訊息以 `v-html="renderFull(content)"` 渲染；TypewriterText emit `done` → `store.markThinkingDone()` + emit `animationDone`.

**After:** 靜態 AI 訊息改用 `<MarkdownRenderer>`；`watch(animate, (val, oldVal) => { if (oldVal && !val) emit('animationDone') })` 偵測串流結束並 emit 事件.

**Priority:** High | **Status:** Implemented (2026-05-11)

---

## Change History

| Date | Change | REQs Affected |
|------|--------|---------------|
| 2026-05-11 | Initial — refactor-code-quality-and-security | REQ-MD-RENDERER-001, REQ-MD-RENDERER-002, REQ-CHAT-BUBBLE-001 |
