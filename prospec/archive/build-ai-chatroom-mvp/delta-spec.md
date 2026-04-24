# Delta Spec：build-ai-chatroom-mvp

## ADDED

### REQ-MOCK-SVC-001: Mock Data Service 封裝

**Feature:** chat-core
**Story:** US-1

**Description:**
將 `src/mock/messages.js` 的 `MESSAGE_MOCK_MAP` 封裝於 `src/services/mock-data.ts`，對外暴露 typed getter；`.vue` 元件禁止直接 import mock 資料。每筆 entry 的 `content` 欄位若含 `Suggested Question:` 尾綴，自動拆分為 `content`（主要回覆）與 `suggestedQuestion`（建議問題），以 `MockResponse.suggestedQuestion: string | null` 暴露。

**Acceptance Criteria:**
1. `MockDataService.getAll()` 回傳 `Record<string, MockResponse>` 型別，無 `any`
2. 其他 services / store 僅透過 `MockDataService` 取得資料
3. 直接 import `src/mock/messages.js` 於 `.vue` 的 ESLint rule 觸發警告
4. `MockResponse` 包含 `suggestedQuestion: string | null`；無 `Suggested Question:` 尾綴時為 `null`
5. 拆分使用 `lastIndexOf('Suggested Question:')` 確保前文中出現相同字串不會錯誤截斷

**Priority:** High

---

### REQ-MATCHER-001: Fuzzy Keyword Matching

**Feature:** chat-core
**Story:** US-1

**Description:**
以 Fuse.js 對使用者輸入與 mock map keys 做 fuzzy matching，回傳分數最高的 response；低於閾值（預設 0.6）或無結果時回傳確定性 fallback 訊息。Fuse 設定：`isCaseSensitive: false`、`ignoreLocation: true`、`minMatchCharLength: 3`。

**Acceptance Criteria:**
1. 5 筆 mock 問題各自匹配到對應回覆
2. 至少 3 筆離題輸入回傳 fallback，不拋出例外
3. 相同輸入多次呼叫必定回傳相同結果（決定性）
4. 純空白輸入不觸發 match，直接回傳 fallback
5. `MatchResult` 包含 `suggestedQuestion: string | null`，從 `MockResponse` 傳遞

**Priority:** High

---

### REQ-TYPEWRITER-001: Typewriter 動畫

**Feature:** chat-rendering
**Story:** US-2

**Description:**
AI 回覆以 `setTimeout` 22ms / 每次推進 3 個字元分段串流（對應 design.html `streamInto` 實作）；串流期間 `isThinking = true`，完成後 emit `done`，parent 呼叫 `store.markThinkingDone()` 還原 `isThinking = false`。串流遇到 URL 文字（`[label](url)` 中的 url 部分）時一次性跳到 `)` 結束符，避免半截連結閃爍；遇到尾端連續換行時一次性跳過。

**Acceptance Criteria:**
1. 文字以穩定節奏（22ms / 3 chars）逐步出現，不阻塞 main thread
2. 串流期間送出按鈕顯示 loading 且不可再次觸發
3. 串流完成後顯示完整回覆；URL 連結不在中間幀出現半截
4. `[text](url)` 中的 url 段落（`/\[[^\]]+\]\([^)]*$/` match）一次性跳至 `)` 後
5. 尾端 `\n+` 跳過，不單獨渲染換行幀

**Priority:** High

---

### REQ-TYPEWRITER-002: Inline Markdown 渲染（無中間幀閃爍）

**Feature:** chat-rendering
**Story:** US-2

**Description:**
`markdown-parser.ts` 在每個 typewriter frame 將已可見字元解析為 HTML；`**bold**` → `<span class="num">`（font-weight: 700），`[text](url)` → `<a class="link" data-tooltip="url" target="_blank" rel="noopener">`；任何 render 幀都不露出 `**` 或 `[...](...)`。`renderPartial` 用 `findSafeEnd` + `stripIncompleteTail` 避免中間幀出現半截 token。

**Acceptance Criteria:**
1. 任一中間幀的 DOM 快照不含 `**` 或 `[` / `]`
2. hover 已渲染 `<a class="link">` 連結時，`LinkTooltip` 元件讀取 `data-tooltip` 屬性顯示 URL（`<Teleport to="body">` viewport-clamped）
3. 格式錯誤的 markdown（未閉合 `**`、`[`）以字面顯示，不破壞版面
4. Link 文字顏色 `$orange-400`，連結 hover 去除 underline
5. `<span class="num">` 套用 `font-weight: 700` 呈現加粗效果

**Priority:** High

---


### REQ-HINT-CAROUSEL-001: Rotating Hint Carousel

**Feature:** chat-ui
**Story:** US-4

**Description:**
對話未開始時，在聊天視窗底部顯示 5 條輪播推薦問題提示（rotating hint carousel）；每 3.6 秒自動切換，帶淡入/位移動畫；點擊 hint 文字填入 composer 輸入框並移焦點；送出首則訊息後隱藏。

**Acceptance Criteria:**
1. 無使用者訊息時，carousel 可見，含 5 條 hint，每條有 FA icon + 文字
2. 點擊 hint 文字後：`chatInput.value = hint.text`、send button 更新、input 獲焦點
3. 送出第一則訊息後 carousel 隱藏，後續對話不再出現
4. Motion-off 模式下切換無動畫，直接替換內容
5. Hint icon 使用 `$teal-300`；hint text hover 顏色 `$teal-700`

**Priority:** High

---

### REQ-CHAT-UI-002: Composer 狀態回饋

**Feature:** chat-ui
**Story:** US-5

**Description:**
送出按鈕依輸入與 AI 狀態呈現四種視覺狀態：disabled-empty / enabled-ready / loading-thinking / idle-after；AI 串流中阻擋重複送出。

**Acceptance Criteria:**
1. 輸入框空白或純空白時按鈕 `disabled`，視覺弱化
2. 輸入含非空白字元後按鈕 enabled
3. 送出後至 typewriter 完成前按鈕顯示 loading spinner，`aria-label="Sending"`
4. 按鈕尺寸 40×40px，`$teal-500` background，FA6 `paper-plane` solid icon（依 `design/components.md` Btn/Icon）

**Priority:** High

---

---

### REQ-WIDGET-LAYOUT-001: 浮動 Chat Widget 佈局

**Feature:** chat-ui
**Story:** US-1 ~ US-5

**Description:**
整個聊天介面以浮動 widget 形式呈現：右下角 Launcher pill（orange accent）+ Chat Window（780×591px floating panel）。Widget 有開/關動畫（pop/popOut keyframe）。

**Acceptance Criteria:**
1. Launcher pill：`137×36px`，`border-radius: 18px`，`$orange-400` bg，FA `fa-wand-magic-sparkles`，label "Ask Nitra AI"
2. Chat window：`780×591px`，`border-radius: 8px`，`box-shadow: 0 30px 60px rgba(38,77,79,0.25)`，`position: fixed`，right/bottom 錨點
3. 開啟動畫：`pop` keyframe（scale 0.94→1，opacity 0→1，0.34s，`transform-origin: bottom right`）
4. 關閉動畫：`popOut` keyframe（0.22s）；完成後隱藏
5. ≤840px：widget 改為全寬全高（`100vw`，`100vh-84px`）

**Priority:** High

---

### REQ-CHAT-HEADER-001: 品牌化 Chat Header

**Feature:** chat-ui
**Story:** US-1

**Description:**
Chat window 頂部 header 使用品牌色 `$teal-700`，包含 Nitra logo SVG、h1 "Nitra AI" + wand icon、subtitle "Hi there, How can we help?"、右上角關閉按鈕。

**Acceptance Criteria:**
1. Header background `$teal-700`，`border-radius: 8px 8px 0 0`，padding `18px 20px`
2. Nitra logo SVG（`46×23px`，white fill）居左
3. h1 "Nitra AI"（30px/700/Source Sans 3）+ `fa-wand-magic-sparkles`（24px）同行
4. Subtitle "Hi there, How can we help?"（16px/400）在 h1 下方
5. 關閉按鈕（`28×28px`，`fa-xmark`，hover `rgba(255,255,255,0.12)`）靠右上角絕對定位

**Priority:** High

---

### REQ-CHAT-BODY-001: 訊息樣式更新

**Feature:** chat-ui
**Story:** US-1, US-2

**Description:**
訊息泡泡樣式依 design.html 更新：AI bubble（gray-0 bg，radius `0 10px 10px 10px`）、User bubble（teal-100 bg，radius `10px 0 10px 10px`）；AI 訊息左側有 24×24 avatar。Streaming caret（▍）在串流中顯示。

**Acceptance Criteria:**
1. AI bubble：bg `#f4f5f6`（`$gray-0`），`border-radius: 0 10px 10px 10px`，Inter 16px/400/1.4
2. User bubble：bg `#a9d4d6`（`$teal-100`），`border-radius: 10px 0 10px 10px`，user msg `padding-right: 90px`
3. AI 訊息有 `24×24` Nitra avatar SVG（teal circle）
4. 串流中 bubble 末尾顯示 `▍` caret（`$teal-700`，1s steps(2) blink）
5. 訊息入場動畫：`slide` keyframe（translateY 8→0，opacity 0→1，0.32s）
6. Link 樣式：`$orange-400`，underline，hover 去除 underline；fixed-position tooltip on hover

**Priority:** High

---

### REQ-COMPOSER-UPDATE-001: Composer 樣式更新

**Feature:** chat-ui
**Story:** US-5

**Description:**
ChatInput 區域無 border input（透明背景）；send button 改為 `36×36px` 圓形（`border-radius: 50%`）、icon 改為 `fa-chevron-right`；新增 attach button；loading ring 使用 SVG stroke animation。

**Acceptance Criteria:**
1. Input：無 border、透明背景、Source Sans 3 16px；placeholder `--text-muted`
2. Send button：`36×36px`，`border-radius: 50%`，`$teal-700` bg，`fa-chevron-right` icon
3. Send button loading：`$gray-500` bg，SVG ring（`stroke-dashoffset` 56.55→0→-56.55，1.4s infinite）
4. Attach button：`20×20px`，`fa-paperclip`，`$gray-500` color
5. InputArea border-top：`1px solid $gray-100`，height `68px`

**Priority:** High

### REQ-WELCOME-001: 開啟 Widget 顯示歡迎訊息

**Feature:** chat-ui
**Story:** US-1

**Description:**
Chat window 開啟時，訊息列表頂端始終顯示一條靜態 AI bubble "Welcome to Nitra AI!"，對應 design.html 的 boot state（`state.messages = [{ role: "ai", text: WELCOME }]`）。此訊息為靜態（無 typewriter 動畫），不計入 `store.turns`，不持久化。

**Acceptance Criteria:**
1. 打開 widget 時，第一條 AI bubble 內容為 "Welcome to Nitra AI!"
2. 歡迎訊息在任何狀態（無對話 / 有對話 / 重整後）都固定顯示於最頂
3. 歡迎訊息無 typewriter 動畫（`animate: false`）
4. 歡迎訊息不存入 `turns`，不佔用對話輪次

**Priority:** High

---

### REQ-SUGGESTED-BUBBLE-001: Suggested Question 第二 AI 泡泡

**Feature:** chat-rendering
**Story:** US-2

**Description:**
AI 回覆若含 `Suggested Question:` 尾綴，parsing 後以獨立的第二條靜態 AI bubble 渲染（前綴文字不顯示，只顯示後面句子）；第二泡泡在主要回覆 typewriter 串流完成後才出現，串流中不可見。

**Acceptance Criteria:**
1. 主要回覆串流完成後，若 `turn.suggestedQuestion !== null`，第二 AI bubble 出現
2. 第二 bubble 內容不含 "Suggested Question:" 前綴，只顯示後面句子
3. 串流期間（`isThinking === true`）第二 bubble 不可見
4. 歷史輪次（非最新）若有 suggestedQuestion，不受 isThinking 限制，直接顯示
5. 第二 bubble 無 typewriter 動畫（靜態 `animate: false`）

**Priority:** High

---

### REQ-SCROLL-AUTO-001: 串流期間自動捲動

**Feature:** chat-ui
**Story:** US-2

**Description:**
AI 回覆 typewriter 串流期間，chat body 需持續捲動至最底，確保使用者看到最新文字；採用 `requestAnimationFrame` 迴圈（rAF loop）而非一次性 scroll，在 `store.isThinking === true` 時每 frame 執行 `chatBodyEl.scrollTop = chatBodyEl.scrollHeight`。

**Acceptance Criteria:**
1. 串流期間每個 animation frame chat body 捲至最底
2. `isThinking` 變為 `false` 時停止 rAF loop，並額外執行一次 `nextTick(scrollToBottom)` 確保最後一幀到位
3. 新 turn 加入時（`turns.length` 改變），觸發一次 `nextTick(scrollToBottom)`
4. 元件 unmount 時取消尚未執行的 rAF（`cancelAnimationFrame`），避免記憶體洩漏

**Priority:** High

---

## MODIFIED

### REQ-CHAT-UI-001-ORIG: Suggested Question Chip → Hint Carousel（已取代）

**Feature:** chat-ui
**Story:** US-4

**Before:**
每則 AI 回覆尾端解析 `Suggested Question:` 文字，渲染為可點擊 chip。

**After:**
改為 Rotating Hint Carousel（見 REQ-HINT-CAROUSEL-001）；`SuggestedChip.vue` 廢棄。`mock-data.ts` 仍解析 `Suggested Question:` 尾綴，但用途改為渲染第二 AI bubble（REQ-SUGGESTED-BUBBLE-001），而非 chip。

**Reason:**
設計方向改為 HTML reference（design/design.html），統一以輪播 hint 取代分散的 chip，視覺更集中；chip 依賴 mock data 格式，carousel 為靜態預設，維護更簡單。

**Priority:** High

---

## REMOVED

### REQ-HISTORY-001: 前端對話持久化（已移除）

**Feature:** chat-history
**Story:** US-3

**Reason:**
此為 QA 示範用途的 chatbot；實務上對話記錄應存於後端，前端 localStorage 快取無必要且增加複雜度。移除 `pinia-plugin-persistedstate` persist 設定，`turns` 改為純 in-memory state，重整後重置為空白。
