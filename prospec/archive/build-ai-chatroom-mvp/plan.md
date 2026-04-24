# Plan：build-ai-chatroom-mvp

## Overview

本 Story 交付 Nitra AI 聊天室第一版 UI，以 mock 資料驅動，建立後續串接真實 API 的前端基座。功能範圍涵蓋：fuzzy-matched 問答、typewriter 動畫、inline markdown 渲染、多輪歷史持久化、suggested question chip 與 composer 狀態回饋。

實作策略由下而上——先建立 TypeScript 型別、Services 層（matcher / markdown-parser / mock-data）、Pinia store，再組裝 UI 元件，最後整合至主頁面。**視覺規格以 `design/components.md` 為準；顏色與字型大小一律使用 `src/css/quasar.variables.scss`、`src/css/tokens.scss` 中定義的 token，禁止硬寫數值。**

## Technical Context (Greenfield)

> AI Knowledge not yet established — substitute context collected below

### Tech Stack Detection
- Language: JavaScript → TypeScript（本 Story 遷移）
- Framework: Vue 3.5 + Quasar v2 + Vite (pnpm)
- Test Framework: Vitest（需安裝）

### Project Structure Scan
- Entry page: `src/pages/IndexPage.vue`（目前為空殼）
- Mock data: `src/mock/messages.js` — 5 筆 Q&A，格式 `Record<string, { message }>`，回覆尾端含 `Suggested Question:` 文字
- Design tokens: `src/css/quasar.variables.scss`（SCSS vars）、`src/css/tokens.scss`（CSS custom properties）
- Design specs: `design/components.md`（元件視覺規格）、`design/node-table.md`（畫面佈局）

### Detected Patterns
- `<script setup lang="ts">` for all SFCs（Constitution P2）
- Services layer in `src/services/*.ts`（Constitution P3）；mock data 不可直接 import 至 .vue
- Quasar 元件優先；SCSS token 驅動，無硬寫 hex（Constitution P4）

### External Dependencies（需安裝）
- `pinia` + `pinia-plugin-persistedstate` — store + 持久化
- `fuse.js` — fuzzy keyword matching
- `vitest` + `@vue/test-utils` — unit tests

## Affected Modules

| Module | Impact | Changes |
|--------|--------|---------|
| mock-svc | Medium | 新建 `src/services/mock-data.ts`，封裝 mock/messages.js |
| message-matcher | High | 新建 `src/services/matcher.ts`（Fuse.js fuzzy） |
| typewriter-renderer | High | 新建 `src/services/markdown-parser.ts` + `TypewriterText.vue` |
| history-store | High | 新建 `src/stores/chat.ts`（Pinia + persistedstate） |
| chat-ui | High | 新建 ChatBubble / SuggestedChip / ChatComposer；更新 IndexPage.vue |

## Implementation Steps

1. **安裝依賴**
   - `pnpm add pinia pinia-plugin-persistedstate fuse.js`
   - `pnpm add -D vitest @vue/test-utils`
   - 新增 `src/boot/pinia.ts`；在 `quasar.config.js` 註冊

2. **型別定義 (`src/types/chat.ts`)**
   - `Message`: `{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }`
   - `ConversationTurn`: `{ user: Message; assistant: Message }`
   - `MatchResult`: `{ content: string; score: number; isFound: boolean }`

3. **Services 層**
   - `src/services/mock-data.ts` — typed wrapper，re-export MESSAGE_MOCK_MAP with TS types
   - `src/services/matcher.ts` — Fuse.js fuzzy；閾值 0.4；低分回傳確定性 fallback message
   - `src/services/markdown-parser.ts` — 逐字 token 解析；`**text**` → `<strong>`，`[t](url)` → `<a>`；支援不完整 token 的中間幀無閃爍渲染

4. **History Store (`src/stores/chat.ts`)**
   - State: `turns: ConversationTurn[]`, `isThinking: boolean`, `pendingInput: string`
   - Actions: `sendMessage(text)`, `fillComposer(text)`, `clearHistory()`
   - `pinia-plugin-persistedstate` 持久化；localStorage 失敗時 graceful fallback（try/catch + console.warn）

5. **TypewriterText.vue**
   - Props: `content: string`；Emits: `done`
   - `requestAnimationFrame` 分段推進，速度預設 30ms / 字元
   - 每幀呼叫 `markdown-parser` 渲染可見部分；任何 frame 都不露出 `**` / `[]()`
   - 串流完成後 emit `done`；store 更新 `isThinking → false`

6. **Chat UI 元件（依 `design/components.md`）**
   - `ChatBubble.vue`：user（`$teal-500` bg, `border-radius: 16px 16px 4px 16px`）/ AI（`$gray-50` bg, `1px $gray-200` border, `border-radius: 16px 16px 16px 4px`）
   - `SuggestedChip.vue`：Badge 樣式（`$teal-50` / `$teal-700`）；click → `store.fillComposer(text)` + focus input
   - `ChatComposer.vue`：`Input/Default` 樣式 + `Btn/Icon`（40×40, `$teal-500`, FA6 `paper-plane` solid）；disabled / loading 兩種視覺狀態

7. **IndexPage.vue 組裝**
   - 可捲動訊息列表（`overflow-y: auto`）；新訊息時 `scrollIntoView({ behavior: 'smooth' })`
   - 底部固定 ChatComposer；對話歷史從 store 讀取並依序渲染
   - 主要互動元素加 `aria-label`（送出按鈕、chip、渲染連結）

8. **Vitest 單元測試**
   - `matcher.spec.ts`：5 key 匹配 + 3 離題 fallback + 純空白 no-op
   - `markdown-parser.spec.ts`：中間幀 snapshot，任一幀不可見 `**` / `[...]`
   - `chat-store.spec.ts`：chip click 驗證 `pendingInput` + focus 行為

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| package.json 無 TS/Vitest，依賴衝突 | High | Step 1 獨立完成，`pnpm install` 後確認 build 無誤再進 Step 2 |
| markdown 中間幀露出原始語法 | High | parser 每幀對 incomplete token 強制 show-styled 或 hide；snapshot test 覆蓋 |
| Fuse.js 閾值造成過多誤匹配 | Medium | matcher.spec.ts 針對閾值做回歸；預設 0.4，可設定 |
| pinia-persist + localStorage 配額 | Low | store action 加 try/catch；session 以記憶體狀態繼續運作 |
