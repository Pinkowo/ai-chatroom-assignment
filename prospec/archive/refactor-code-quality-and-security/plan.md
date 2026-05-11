# Plan：refactor-code-quality-and-security

## Overview

本 Story 修正四類問題：檔案結構混亂與 Vue 慣用法偏差、手寫 markdown parser 維護風險、`v-html` XSS 攻擊面、計時器驅動的 TypewriterText 架構與 SSE 不相容。所有修正在同一分支完成，因為 US-3（v-html 移除）與 US-4（串流架構）共用同一個 `MarkdownRenderer` 元件，必須一起設計。

策略上分七個步驟：①先做零依賴的結構清理（移檔、刪檔、路由），②修正 ChatComposer template ref，③以 `<Transition>` 取代 IndexPage 的動畫 hack，④建立 `MarkdownRenderer`（marked + h() VNode 渲染），⑤建立 mock-stream 並重構 matcher，⑥重構 store 為 `for await` 串流 + 簡化 TypewriterText，⑦補測試。

## Technical Context (Greenfield)

> AI Knowledge 尚未建立 — 以直接掃描原始碼作為替代

### Tech Stack Detection
- **Language**: TypeScript 6.0.3
- **Framework**: Vue 3.5.17 + Quasar 2.18.1 + Pinia
- **Test Framework**: Vitest 4.1.5 + @vue/test-utils

### Project Structure Scan
- Entry: `src/pages/IndexPage.vue` (chat widget 主頁)
- `src/components/` — ChatComposer, ChatBubble, TypewriterText, LinkTooltip 等
- `src/services/` — matcher.ts（業務邏輯）、mock-data.ts（工具，應移至 utils）
- `src/stores/chat.ts` — Pinia store，`sendMessage` 目前單次 Promise

### Detected Patterns
- 元件一律 `<script setup lang="ts">`，無 Options API
- SCSS design tokens（`$teal-700`, `var(--font-size-md)` 等）
- 測試以 Vitest + vue/test-utils，mock 服務層（`vi.mock('src/services/matcher')`）

### External Dependencies (relevant)
- `marked` — 待安裝，用於 inline token 解析
- `fuse.js` — 現有，fuzzy match
- `pinia` — 現有，store

## Affected Modules

| Module | Impact | Changes |
|--------|--------|---------|
| `src/utils/` (new) | High | 建立目錄，遷入 mock-data.ts；新增 mock-stream.ts、markdown-parser-utils.ts |
| `src/components/MarkdownRenderer.ts` (new) | High | VNode render function 元件，以 marked.Lexer + h() 取代 v-html |
| `src/components/TypewriterText.vue` | High | 移除計時器，改為 `<MarkdownRenderer :partial="true">` |
| `src/components/ChatBubble.vue` | Medium | 移除 v-html，改用 MarkdownRenderer；watch animate→emit animationDone |
| `src/stores/chat.ts` | Medium | sendMessage 改 for await 消費 AsyncIterable；stream 結束後直接 isThinking=false |
| `src/services/matcher.ts` | Medium | 回傳 `{ stream: AsyncIterable<string>, suggestedQuestion }` 取代 MatchResult |
| `src/pages/IndexPage.vue` | Medium | `<Transition>` 取代 isClosing/chatPanelEl hack；移除 scaffold 路由 |
| `src/components/ChatComposer.vue` | Low | useTemplateRef + watch，更名 callback |
| 刪除: ColorsPage, TypographyPage, ColorCard, EssentialLink, quasar-logo | Low | 刪除 scaffold 殘留 |

## Implementation Steps

1. **結構清理：移檔、刪檔、更新路由**
   - 建立 `src/utils/`，將 `mock-data.ts` 從 `services/` 移至 `utils/`
   - 刪除 `EssentialLink.vue`、`quasar-logo-vertical.svg`、`ColorsPage.vue`、`TypographyPage.vue`、`ColorCard.vue`
   - 移除 `routes.js` 中的 `colors`、`typography` 路由
   - 更新 `matcher.ts` 中 `import mock-data` 的路徑

2. **ChatComposer template ref 修正**
   - 改用 `useTemplateRef<HTMLInputElement>('textInput')`（Vue 3.5+ API）
   - 以 `watch(textInputRef, el => emit('inputRef', el))` 取代 callback ref
   - 移除名為 `onMounted` 的 callback 函式

3. **IndexPage Transition 重構**
   - 以 `<Transition name="chat-pop">` 包裹 `v-show="isOpen"` 的 `.chat-wrap`
   - CSS 新增 `.chat-pop-enter-active .chat { animation: chat-pop ... }` 與 leave-active 對應規則
   - 移除 `isClosing`、`chatPanelEl` ref、`openWidget`/`closeWidget` 內的 hack；onToggle 直接切換 `isOpen`
   - 保留 `v-show`（不改 `v-if`）確保 DOM 狀態（對話記錄）保存

4. **MarkdownRenderer 元件建立（marked + h()，無 v-html）**
   - 安裝 `marked`
   - 建立 `src/utils/markdown-parser-utils.ts`：遷入 `findSafeEnd`、`stripIncompleteTail`
   - 建立 `src/components/MarkdownRenderer.ts`（render function 元件）：
     - `marked.Lexer.lexInline(content)` 解析 inline tokens
     - `h('span', { class:'num' })` 對應 `strong` token
     - `h('a', { class:'link', 'data-tooltip':href, target:'_blank', rel:'noopener noreferrer' })` 對應 `link` token，href 須通過 `/^https?:\/\//i` 白名單，否則降級純文字
     - 接受 `partial?: boolean` prop：true 時先 `findSafeEnd` 再解析
   - 更新 `ChatBubble.vue`：移除 `v-html`，改用 `<MarkdownRenderer>`；`watch(animate, ...)` 偵測 true→false，emit `animationDone`（取代 TypewriterText 的 @done）
   - 移除 `renderFull`/`renderPartial` 從 `src/services/markdown-parser.ts` 的對外 export（或整個檔案）

5. **mock-stream + matcher 重構**
   - 建立 `src/utils/mock-stream.ts`：
     ```
     createMockStream(content): AsyncGenerator<string>
     // CHUNK_SIZE=3, DELAY_MS=22，逐 chunk yield，模擬 SSE 節奏
     ```
   - 更新 `src/services/matcher.ts`：
     - 仍先 `match()` 取得完整 content（解析 suggestedQuestion）
     - 改回傳 `{ stream: AsyncIterable<string>, suggestedQuestion: string | null }`
     - `stream = createMockStream(content)`

6. **chat.ts store + TypewriterText 串流化**
   - 更新 `sendMessage`：`for await (const chunk of stream) { turn.assistant.content += chunk }`
   - 串流結束後直接 `isThinking.value = false`（不再依賴 TypewriterText emit done）
   - 保留 `markThinkingDone()` 作為 public API（未來 SSE 斷線重連等外部呼叫）
   - 簡化 `TypewriterText.vue`：移除 timer/position，改為 `<MarkdownRenderer :content="props.content" :partial="true" />`；移除 `done` emit

7. **補測試**
   - `markdown-parser.spec.ts` → 改測 `MarkdownRenderer`：加 `javascript:` URL 降級、`rel` 屬性、streaming partial 安全性
   - `chat-store.spec.ts` → mock `matcher` 改回傳 `{ stream: asyncIterable(['chunk1','chunk2']), suggestedQuestion }`；驗證 content 逐步累加
   - `chat-composer.spec.ts` → 確認 `useTemplateRef` 後 inputRef emit 仍正確

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| marked inline token API 與現有 partial 安全邏輯整合複雜 | Medium | 保留 `findSafeEnd`/`stripIncompleteTail`，只替換 token→HTML 那一層；若 marked 不提供 `lexInline`，改用 `marked.parse()` 搭配 custom renderer |
| Transition + v-show 的動畫觸發時機與原 isClosing 不完全等價 | Low | 以瀏覽器 DevTools 確認 enter/leave 動畫；duration 設定需與 CSS animation 時長一致（enter 340ms, leave 220ms） |
| for await 串流更新 Pinia reactive array nested property | Low | 直接 `turns.value[idx]!.assistant.content += chunk` — Vue 3 ref 對 deep mutation 響應正常 |
| 測試中 mock AsyncIterable 寫法學習成本 | Low | 使用 async generator: `async function* mockStream() { yield 'a'; yield 'b' }` |
