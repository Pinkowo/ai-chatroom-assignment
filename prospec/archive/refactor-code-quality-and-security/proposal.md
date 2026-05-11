# Proposal：refactor-code-quality-and-security

## Background

程式碼審視後發現四類問題：①`services/` 混雜非 API 工具檔、Vue 3 慣用法偏差（callback ref 型別錯誤、手動 animation restart hack、語意衝突的函式名）、存在 Quasar 預設 scaffold 殘留檔案；②手寫 markdown parser 維護成本高、邊界情境覆蓋不足；③兩處 `v-html` 與 URL scheme 未驗證形成 XSS 攻擊面；④`TypewriterText` 計時器驅動架構與 SSE streaming 不相容，mock-data 回傳格式也不適合改接真實 API。本 Story 一次性修正上述所有問題。

## User Stories

### US-1：清理專案結構與 Vue 慣用法 [P1]

As a 開發者，
I want 檔案結構符合「services 只放 API 客戶端」原則、Vue 3 template ref 使用正確 API、函式名語意清晰、移除未使用的 scaffold 殘留，
So that 新人閱讀時不受誤導，IDE 無紅底線，codebase 無廢棄雜訊。

**Acceptance Scenarios:**

- WHEN 瀏覽 `src/services/`，THEN 僅剩 `matcher.ts`；`mock-data.ts` 移至 `src/utils/`，其餘 parser/stream 工具也在 `utils/`
- WHEN 查看 `ChatComposer.vue`，THEN 使用 `useTemplateRef<HTMLInputElement>()` + `watch` 取代 callback ref，TypeScript 紅底線消失
- WHEN 查看 `ChatComposer.vue`，THEN 原 `onMounted` 已更名（例 `setInputRef`），不再與 Vue lifecycle hook 名稱衝突
- WHEN 查看 `src/components/` 與 `src/assets/`，THEN `EssentialLink.vue`、`quasar-logo-vertical.svg` 已刪除；`ColorsPage.vue`、`TypographyPage.vue`、`ColorCard.vue` 及其路由已移除
- WHEN 執行全部測試，THEN 所有測試通過，import 路徑已更新

**Independent Test:**
VS Code 開啟 `ChatComposer.vue` → 輸入欄無 TypeScript 錯誤；`src/services/` 只見 `matcher.ts`；`src/utils/` 見 `mock-data.ts`；瀏覽器訪問 `/colors` 回傳 404。

---

### US-2：以 Vue Transition 取代動畫 hack，並修正連結安全屬性 [P1]

As a 開發者，
I want 聊天視窗開關動畫使用標準 `<Transition>` 元件實作，外部連結帶有完整安全屬性，
So that 移除 `style.animation = 'none'` / `offsetHeight` reflow hack，並消除 referrer 洩漏風險。

**Acceptance Scenarios:**

- WHEN 點擊 Launcher 開啟聊天視窗，THEN pop 動畫正確播放
- WHEN 點擊關閉，THEN 收起動畫正確播放後視窗消失
- WHEN 連續開關多次，THEN 每次動畫均完整播放，無閃爍
- WHEN 查看 `IndexPage.vue`，THEN 不存在 `style.animation = 'none'`、`offsetHeight`、`isClosing` 等字樣
- WHEN AI 回覆包含外部連結，THEN `<a>` 帶有 `rel="noopener noreferrer"` 及 `target="_blank"`

**Independent Test:**
連按 5 次開關 → 動畫均正常；在 AI 回覆連結上右鍵「複製連結目標」確認 href 安全屬性存在。

---

### US-3：以 marked + Vue h() 取代 v-html，消除 XSS [P1]

As a 開發者，
I want 使用 `marked.lexer()` 解析 token、Vue `h()` 函式渲染 VNode，徹底移除 `v-html`，
So that 消除 XSS 攻擊面、`javascript:` URL 注入漏洞，且不依賴 DOMPurify 額外套件。

**Acceptance Scenarios:**

- WHEN 查看所有 `.vue` 檔案，THEN 不存在任何 `v-html` 指令
- WHEN markdown content 包含 `**bold**`，THEN 渲染為 `<span class="num">bold</span>`（保留現有樣式）
- WHEN markdown content 包含 `[text](https://example.com)`，THEN 渲染為帶 `data-tooltip`、`class="link"` 的 `<a>` 元素
- WHEN markdown content 包含 `[x](javascript:alert(1))`，THEN 渲染為純文字，不產生可點擊連結
- WHEN markdown content 包含邊界 case（未閉合 `**`、孤立 `[`），THEN 安全降級顯示純文字
- WHEN 執行測試，THEN markdown 測試涵蓋 javascript: injection case 並通過

**Independent Test:**
在 mock 資料中臨時插入 `[x](javascript:alert(1))` → 點擊後無 alert；正常 bold/link 渲染不變；DevTools Elements 確認無 innerHTML 直接寫入。

---

### US-4：SSE 相容串流架構 + mock-data 重構 [P1]

As a 開發者，
I want `TypewriterText` 以響應式 prop 驅動取代計時器、mock-data 改為 `AsyncIterable` 輸出、store 以 `for await` 逐 chunk 累加，
So that 未來切換真實 SSE API 只需替換 stream 來源，隱藏 markdown syntax 的 typewriter 效果自動保留。

**Acceptance Scenarios:**

- WHEN AI 回覆串流中，THEN 使用者看到文字逐漸出現，markdown syntax（`**`、`[`）從不以原始字元顯示
- WHEN 串流結束，THEN AI 回覆完整顯示，Suggested Question 泡泡依序出現
- WHEN 查看 `TypewriterText.vue`，THEN 不存在 `setTimeout` 計時器，改為 `watch(props.content)` 或 `computed` 響應 prop 變化
- WHEN 查看 `src/utils/mock-stream.ts`（新增），THEN 存在 `createMockStream(content): AsyncIterable<string>`，以固定 chunk size + delay 模擬 SSE 節奏
- WHEN 查看 `chat.ts` store，THEN `sendMessage` 以 `for await` 消費串流，每 chunk 更新 `turn.assistant.content`
- WHEN 替換 `createMockStream` 為真實 `EventSource`，THEN 不需修改 store 或 TypewriterText 的邏輯

**Independent Test:**
開啟 Network DevTools（或加 console.log）確認 store 收到多次 chunk；修改 `CHUNK_SIZE = 1` → 文字逐字出現；markdown 符號不在任何 frame 暴露為原始字元。

---

## Edge Cases

- **`matcher.ts` 歸屬**：`matcher.ts` 為業務邏輯層（fuzzy match），維持在 `services/`，不移至 `utils/`
- **`v-show` vs `v-if` + `<Transition>`**：用 `v-show` 搭配 `<Transition>` 保留 DOM 狀態（對話歷史），不可改為 `v-if`
- **`renderPartial` 串流安全性**：必須保留 `findSafeEnd` / `stripIncompleteTail` 邏輯；`marked.lexer()` 用於 tokenize safe portion
- **Suggested Question 出現時機**：串流結束（`isThinking = false`）後由 ChatBubble 的 `watch(animate)` 偵測變化並 emit `animation-done`，IndexPage 再顯示 Suggested Question
- **`markThinkingDone()` 角色**：SSE 架構下，store 串流結束時直接 `isThinking.value = false`，`markThinkingDone()` 仍保留但不再由 TypewriterText 呼叫

## Functional Requirements

- **FR-001**：建立 `src/utils/`，遷移 `mock-data.ts`；新增 `markdown-renderer.ts`（基於 marked）、`mock-stream.ts`
- **FR-002**：`ChatComposer.vue` 改用 `useTemplateRef<HTMLInputElement>()` + `watch`，callback 更名
- **FR-003**：`IndexPage.vue` 改用 `<Transition name="chat-pop">` + `v-show`，移除 `isClosing`、`chatPanelEl` ref、animation restart hack
- **FR-004**：刪除 `EssentialLink.vue`、`quasar-logo-vertical.svg`、`ColorsPage.vue`、`TypographyPage.vue`、`ColorCard.vue`，並移除對應路由
- **FR-005**：引入 `marked`，以 `marked.lexer()` 取代手寫 `parseTokens()`，保留 `<span class="num">` 與 `data-tooltip` 自訂 renderer
- **FR-006**：建立 `MarkdownRenderer.vue`，以 Vue `h()` 渲染 marked tokens，取代 `v-html`；TypewriterText、ChatBubble 改用此元件
- **FR-007**：連結渲染加入 URL scheme 白名單（`^https?://`），非合規 URL 降級純文字；所有連結補 `rel="noreferrer"`
- **FR-008**：`src/utils/mock-stream.ts` 實作 `createMockStream(content: string): AsyncIterable<string>`
- **FR-009**：`matcher.ts` 改回傳 `{ stream: AsyncIterable<string>, suggestedQuestion: string | null }`（先解析 suggestedQuestion，再 stream content）
- **FR-010**：`chat.ts` store 以 `for await` 消費串流，每 chunk `turn.assistant.content += chunk`，串流結束後 `isThinking.value = false`
- **FR-011**：`TypewriterText.vue` 移除計時器，改以 `computed(() => renderPartial(props.content))` 響應 prop；`done` event 由 ChatBubble 的 animate watch 取代

## Success Criteria

- **SC-001**：`src/services/` 只剩 `matcher.ts`；`src/utils/` 含 `mock-data.ts`、`mock-stream.ts`、`markdown-renderer.ts`
- **SC-002**：`ChatComposer.vue` TypeScript 零錯誤
- **SC-003**：`IndexPage.vue` 不含 `style.animation`、`offsetHeight`、`isClosing`
- **SC-004**：全部 `.vue` 檔案無 `v-html`
- **SC-005**：`javascript:` URL 測試通過（純文字降級）
- **SC-006**：所有外部連結含 `rel="noopener noreferrer"`
- **SC-007**：`TypewriterText.vue` 不含 `setTimeout`
- **SC-008**：全部測試通過，新增 XSS、URL scheme、streaming chunk 測試

## Related Modules

- **chat-ui（ChatComposer）**：US-1 ref 修正、rename
- **chat-rendering（ChatBubble、TypewriterText）**：US-3 v-html 移除、US-4 串流響應
- **chat-core（store、matcher）**：US-4 串流架構
- **utils（markdown-renderer、mock-data、mock-stream）**：US-1 搬移、US-3/4 新增
- **routing（routes.js）**：US-1 移除設計參考頁路由

## Open Questions

- [x] v-html 替換策略：**B（Vue h() component renderer）** ✓
- [x] Markdown 套件：**marked（35k ⭐）** ✓
- [x] SSE 相容架構：**AsyncIterable + for await + TypewriterText reactive prop** ✓

## Constitution Check

- [ ] Vue Composition API Only — `useTemplateRef`、`<Transition>`、`h()` 均為 Vue 3 first-class API
- [ ] Type Safety — callback ref 型別修正；`AsyncIterable<string>` 明確型別；marked token 型別完整
- [ ] Service Layer Encapsulation — `services/` 職責更清晰；utils 分離；streaming 抽象隔離 mock 與真實 SSE
- [ ] CONSTITUTION.md 尚未建立 — 建議此 Story 完成後補建

## UI Scope

**Scope:** partial
