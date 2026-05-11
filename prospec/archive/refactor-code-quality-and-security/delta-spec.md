# Delta Spec：refactor-code-quality-and-security

## ADDED

### REQ-STRUCT-001: 建立 utils/ 資料夾並遷移非 API 工具

**Feature:** code-quality
**Story:** US-1

**Description:**
建立 `src/utils/` 目錄，將非 API 工具檔從 `services/` 遷移至此，確保 `services/` 只存放 API 客戶端層。

**Acceptance Criteria:**
1. `src/utils/` 存在並包含 `mock-data.ts`、`mock-stream.ts`；`markdown-parser-utils.ts` **不建立**（`streaming-markdown` library 取代所有 partial-safe 邏輯）
2. `src/services/` 僅剩 `matcher.ts`；原 `markdown-parser.ts` 已刪除
3. 所有 import 路徑更新，測試通過

**Implementation Note:**
原計畫建立 `markdown-parser-utils.ts`（`findSafeEnd`/`stripIncompleteTail`），後改採 `streaming-markdown` library，手寫 partial-safe 邏輯不再需要。`marked` 亦一併移除。

**Priority:** High

---

### REQ-STRUCT-002: 刪除 Quasar scaffold 殘留檔案

**Feature:** code-quality
**Story:** US-1

**Description:**
刪除 Quasar 初始化時產生的未使用元件、靜態資源與對應路由，減少 codebase 雜訊。

**Acceptance Criteria:**
1. 以下檔案已不存在：`EssentialLink.vue`、`quasar-logo-vertical.svg`、`ColorsPage.vue`、`TypographyPage.vue`、`ColorCard.vue`
2. `routes.js` 中 `/colors`、`/typography` 路由已移除；訪問這些路徑回傳 404
3. 沒有任何其他檔案 import 上述元件

**Priority:** Medium

---

### REQ-CHAT-COMPOSER-001: useTemplateRef + 語意化命名

**Feature:** code-quality
**Story:** US-1

**Description:**
以 Vue 3.5 `useTemplateRef<HTMLInputElement>()` 取代 callback ref，並將語意衝突的 `onMounted` 函式移除，以 `watch` 處理 ref 掛載後的 emit 邏輯。

**Acceptance Criteria:**
1. `ChatComposer.vue` 使用 `useTemplateRef<HTMLInputElement>('textInput')` 取得文字輸入元素
2. 不存在任何名為 `onMounted` 的自定義函式
3. `inputRef` emit 仍在元素掛載時觸發，行為與修改前相同
4. IDE TypeScript 零錯誤，`:ref` 無紅底線

**Priority:** High

---

### REQ-INDEX-PAGE-001: Vue Transition 取代 animation hack

**Feature:** code-quality
**Story:** US-2

**Description:**
以 Vue 內建 `<Transition name="chat-pop">` 搭配 `v-show` 管理聊天視窗的開關動畫，移除手動 animation restart workaround。

**Acceptance Criteria:**
1. `IndexPage.vue` 不包含 `style.animation = 'none'`、`offsetHeight`、`isClosing` 任何字樣
2. `chatPanelEl` template ref 已移除
3. 開啟動畫（340ms）與關閉動畫（220ms）視覺效果與修改前相同
4. 連續快速開關不出現動畫異常
5. `v-show` 保留（不改為 `v-if`），DOM 狀態（對話記錄）不丟失

**Priority:** High

---

### REQ-MD-RENDERER-001: MarkdownRenderer VNode 元件

**Feature:** xss-prevention
**Story:** US-3

**Description:**
建立 `src/components/MarkdownRenderer.ts`（render function 元件），以 `marked.Lexer` inline tokenizer + Vue `h()` 函式將 markdown 渲染為 VNode，徹底移除 `v-html`。

**Acceptance Criteria:**
1. 不存在任何 `v-html` 指令（`TypewriterText.vue`、`ChatBubble.vue` 均已移除）
2. `**bold**` 渲染為帶 `class="num"` 的 `<strong>` 元素
3. `[text](https://example.com)` 渲染為 `<a class="link" data-tooltip="https://example.com" target="_blank" rel="noopener noreferrer">text</a>`
4. `partial` prop 為 true 時，`streaming-markdown` 樂觀渲染機制確保不暴露原始 markdown 符號（涵蓋所有 token 類型，不只 `**` 和 `[`）

**Implementation Note:**
使用 `streaming-markdown`（DOM renderer）取代 `marked.Lexer + Vue h()`（VNode renderer）。核心差異：streaming-markdown 直接操作 DOM，Vue 不管理子節點；安全渲染由 library 的 incremental parser 負責，而非 `findSafeEnd` 枚舉法。

**Priority:** High

---

### REQ-MD-RENDERER-002: URL scheme 白名單與 rel 完整性

**Feature:** xss-prevention
**Story:** US-3

**Description:**
連結渲染加入 URL scheme 驗證，拒絕非 `http(s)://` URL；所有外部連結補齊 `rel="noopener noreferrer"`。

**Acceptance Criteria:**
1. `[x](javascript:alert(1))` 渲染為純文字 `x`，不產生 `<a>` 標籤
2. `[x](data:text/html,<h1>XSS</h1>)` 同上，降級純文字
3. 所有合法外部連結的 `<a>` 標籤包含 `rel="noopener noreferrer"`

**Priority:** High

---

### REQ-STREAM-001: mock-stream AsyncGenerator

**Feature:** sse-streaming
**Story:** US-4

**Description:**
建立 `src/utils/mock-stream.ts`，提供 `createMockStream(content)` 模擬 SSE 節奏的 AsyncGenerator，未來可替換為真實 `EventSource`。

**Acceptance Criteria:**
1. `createMockStream(content)` 回傳 `AsyncGenerator<string>`
2. 以固定 chunk size（約 3 字元）yield 內容，每 chunk 之間有 delay（約 22ms）
3. 所有 chunk 串接後等於原始 `content`，無遺漏

**Priority:** High

---

### REQ-STREAM-002: matcher 回傳 AsyncIterable 串流

**Feature:** sse-streaming
**Story:** US-4

**Description:**
`matcher.ts` 的 `match()` 改回傳 `{ stream: AsyncIterable<string>, suggestedQuestion: string | null }`，store 透過此介面消費串流；此介面設計相容真實 SSE EventSource。

**Acceptance Criteria:**
1. `match()` 回傳型別為 `Promise<{ stream: AsyncIterable<string>, suggestedQuestion: string | null }>`
2. `suggestedQuestion` 在串流開始前即可取得（upfront 解析）
3. 未匹配輸入時，`stream` 仍為合法 AsyncIterable（yield fallback 回覆）

**Priority:** High

---

## MODIFIED

### REQ-STORE-SEND-001: sendMessage 改為串流消費

**Feature:** sse-streaming
**Story:** US-4

**Before:**
`sendMessage` 呼叫 `match(text)` 取得完整 `MatchResult`，一次性設定 `turn.assistant.content`，`isThinking` 由 TypewriterText emit `done` 後才設為 false。

**After:**
`sendMessage` 以 `for await` 消費 `match()` 回傳的 `AsyncIterable<string>`，每 chunk 累加至 `turn.assistant.content`。串流結束後直接 `isThinking.value = false`，不再依賴 TypewriterText 的事件。

**Reason:**
SSE 相容架構：串流結束即視為「思考完成」，TypewriterText 只負責渲染；職責分離更清晰。

**Priority:** High

---

### REQ-TYPEWRITER-001: TypewriterText 去計時器化

**Feature:** sse-streaming
**Story:** US-4

**Before:**
`TypewriterText.vue` 接收完整 `content`，以 `setTimeout(tick, 22ms)` 計時器逐字推進 `position`，呼叫 `renderPartial(content.slice(0, position))` 後 emit `done`。

**After:**
`TypewriterText.vue` 新增 `streaming?: boolean` prop。`streaming=true`（主 AI 回覆）：直接渲染 `<MarkdownRenderer :content="props.content" :partial="true" />`，SSE 串流節奏即為動畫節奏，無計時器。`streaming=false`（suggested question）：保留 timer 逐字推進 `visibleContent`，確保 typewriter 效果。`done` emit 改由 ChatBubble `watch(animate)` 偵測 true→false 取代。

**Reason:**
主 AI 回覆以 SSE 串流節奏取代計時器；suggested question 無 SSE 來源，仍需計時器產生 typewriter 效果。兩種模式均通過同一 `MarkdownRenderer` 渲染，切換真實 SSE API 時只需移除 timer 路徑。

**Priority:** High

---

### REQ-CHAT-BUBBLE-001: ChatBubble 去 v-html 化 + 動畫事件

**Feature:** xss-prevention
**Story:** US-3

**Before:**
靜態 AI 訊息以 `v-html="renderFull(content)"` 渲染；TypewriterText emit `done` → `onDone()` → `store.markThinkingDone()` + emit `animationDone`。

**After:**
靜態 AI 訊息改用 `<MarkdownRenderer :content="content" />`；`watch(animate, (val, oldVal) => { if (oldVal && !val) emit('animationDone') })` 偵測串流結束並 emit 事件，不依賴 TypewriterText。

**Reason:**
移除 `v-html` 消除 XSS 風險；動畫完成事件改由 ChatBubble 的 prop 變化驅動，符合 SSE 架構中 store 主導生命週期的設計。

**Priority:** High

---

## REMOVED

### REQ-MARKDOWN-PARSER-EXPORT: 移除 src/services/markdown-parser.ts 的 export

**Reason:**
`renderFull` 與 `renderPartial` 已由 `MarkdownRenderer` 元件的 VNode 渲染路徑取代；`findSafeEnd`/`stripIncompleteTail` 工具函式遷至 `src/utils/markdown-parser-utils.ts`。整個 `markdown-parser.ts` 檔案可刪除。

---

### REQ-SCAFFOLD-PAGES: 移除設計參考頁

**Reason:**
`ColorsPage`、`TypographyPage`、`ColorCard` 為開發期設計系統參考工具，已完成其使命，不應存在於生產 codebase。路由一併移除。

---
