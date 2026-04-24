# Proposal：build-ai-chatroom-mvp

## Background（背景）

Smart procurement 的願景需要一個對話式入口，讓顧客能直接詢問產品相關問題（比價、最低價、熱門品項、替代品），並獲得結構化的 AI 回覆。本 Story 交付第一版聊天室 UI，以 mock 資料驅動，作為之後串接真實 API 時可直接替換的前端基座。若少了一個可運作的聊天介面，就無法端到端驗證「對話式採購」的使用者體驗。

## User Stories（使用者故事）

### US-1：模糊匹配的問答流程 [P1]

As a 正在探索採購選項的顧客，
I want 用自然語言輸入問題，並取得相關的 AI 回答，
So that 我能快速找到產品資訊，不必手動翻找目錄。

**Acceptance Scenarios：**

- WHEN 使用者輸入的問題關鍵字與 mock map 某個 key 有高度相符，且按下送出，THEN 該筆對應的 assistant 訊息會被渲染出來。
- WHEN 使用者送出的問題找不到合理匹配項，THEN 顯示一則 graceful fallback 訊息（例如：「Sorry, I encountered an error. Please try again later.」）。
- WHEN 比對分數在多個 key 之間接近，THEN 取分數最高者並維持決定性（同樣輸入必定得到同樣輸出）。

**Independent Test：**
對 matcher 模組單獨進行單元測試（Vitest），輸入 5 個 mock key 與幾個離題輸入，驗證對應的 response key 或 fallback 行為。

---

### US-2：Typewriter 動畫與內嵌樣式渲染 [P1]

As a 正在閱讀 AI 回覆的顧客，
I want 訊息以逐字顯示的打字機效果呈現，且粗體與連結即時以樣式化元素出現（而非露出 markdown 原始語法），
So that 閱讀體驗自然、訊息在顯示過程中就是漂亮的樣式。

**Acceptance Scenarios：**

- WHEN 一則 assistant 訊息開始串流，THEN 文字以穩定節奏逐字出現，直到全文渲染完成。
- WHEN 串流經過 `**bold**` 或 `[text](url)` 等 markdown token，THEN 畫面上顯示的是已樣式化的粗體或超連結元素，**任何 render 幀都不得露出 `**`或`[](...)` 原始語法\*\*。
- WHEN 使用者將游標 hover 在已渲染的超連結上，THEN 顯示 tooltip / hint，內容為該連結的目標 URL。
- WHEN Typewriter 還在串流中段，THEN 尚未完整的粗體 / 連結片段也要以樣式化形式漸進呈現，不可閃現原始 markdown 符號。

**Independent Test：**
渲染一則同時包含粗體、連結與純文字的訊息；手動推進 typewriter timer，於中間幀對 DOM 取 snapshot，確認任一幀的可見文字中都不存在 `**` 或 `[...]`。

---

### US-3：多輪對話與 Pinia 持久化歷史 [P1]

As a 回訪的顧客，
I want 先前的訊息依序保留，且重新整理頁面後也能還原，
So that 我能隨時檢視上下文、延續對話，不會遺失工作成果。

**Acceptance Scenarios：**

- WHEN 使用者送出第 2 次（或之後）訊息，THEN 所有先前的 user + assistant 訊息都依時間順序保留在新訊息之上。
- WHEN 使用者重新整理頁面，THEN 完整的對話歷史自 Pinia store（經 pinia-plugin-persistedstate 序列化）還原並依序渲染。
- WHEN 歷史超出可視範圍，THEN 訊息列表可捲動，且在新回合產生時自動捲到最新訊息。

**Independent Test：**
先往 Pinia persist storage 寫入一份已知歷史 payload，載入頁面後驗證所有訊息依序渲染；再送出一則新訊息、重新整理，驗證新回合也已被保留。

---

### US-4：Hint Carousel 快速問題提示 [P1]

As a 不確定下一步要問什麼的顧客，
I want 在對話尚未開始時，畫面下方顯示輪播的推薦問題提示（hint carousel），點下去將問題文字填入輸入框，
So that 我能快速帶入問題，並視需要修改後再送出。

**Acceptance Scenarios：**

- WHEN 聊天視窗開啟且尚無任何使用者訊息，THEN 畫面底部顯示輪播推薦提示（5 條 hint，每 3.6 秒自動切換，附圖示與文字）。
- WHEN 使用者點擊 hint 文字，THEN 該文字填入 composer 輸入框，焦點自動移至輸入框，使用者可直接修改或按送出。
- WHEN 使用者送出第一則訊息後，THEN hint carousel 隱藏，不再顯示。
- WHEN motion 關閉時，THEN carousel 切換不播放動畫，直接跳換。

**Independent Test：**
驗證 carousel 在空白對話下渲染且每條 hint 文字正確；模擬點擊後驗證輸入框的值與 hint 文字相符，且焦點落在輸入框上；送出訊息後驗證 carousel 隱藏。

---

### US-5：Composer 狀態回饋 [P1]

As a 正在輸入的顧客，
I want 送出按鈕能清楚反映「輸入是否有效」與「AI 是否在思考」，
So that 我能理解系統狀態，不會在等待過程中重複送出。

**Acceptance Scenarios：**

- WHEN 輸入框為空或只有空白字元，THEN 送出按鈕為 disabled（不可互動、視覺弱化）。
- WHEN 輸入框至少有一個非空白字元，THEN 送出按鈕變為 enabled。
- WHEN 訊息已送出、AI 處於 thinking 狀態（回應前的 delay 或 typewriter 串流中），THEN 送出按鈕顯示動畫 loading indicator，且不可再次送出。
- WHEN AI 串流完成，THEN 送出按鈕依目前輸入框內容回到 idle 或 disabled 狀態。

**Independent Test：**
讓 composer 依序經過「空 → 有輸入 → 送出 → thinking → 完成」五個狀態，於每個節點斷言按鈕的 `disabled` 屬性、視覺 class 與 loading spinner 是否存在。

---

## Edge Cases（邊界情境）

- **純空白送出**：僅含空白字元的輸入絕對不可觸發送出或 match。
- **重複快速送出**：AI 串流期間點擊送出需為 no-op（由 loading 狀態覆蓋）。
- **無匹配 fallback**：matcher 絕對不可拋例外，必定回傳 match 結果或確定性的 fallback 訊息。
- **localStorage 不可用 / 配額不足**：Pinia persist 寫入失敗時需 graceful fallback，當前 session 仍需以記憶體狀態正常運作。
- **長訊息渲染**：typewriter 不得阻塞 main thread（使用 `requestAnimationFrame` 或分段 `setTimeout`）。
- **串流中離開頁面**：持久化歷史應保存「完整」回覆，而非串流到一半的片段。
- **格式錯誤的 markdown**（未閉合的 `**` 或 `[`）：以字面顯示，不得破壞版面。

## Functional Requirements（功能需求）

- **FR-001**：提供 chat 畫面，包含可捲動的訊息列表與底部的 composer（輸入框 + 送出按鈕）。
- **FR-002**：以 fuzzy keyword matching 對 mock Record<question, response> 做比對，回傳最佳匹配或確定性 fallback。
- **FR-003**：assistant 訊息採 typewriter 動畫逐字串流，節奏可設定。
- **FR-004**：解析 assistant 內容中的 markdown，將粗體與連結以樣式化行內元素渲染；**任一 render 幀都不得露出原始 markdown 語法**。
- **FR-005**：當使用者 hover 已渲染的連結時，顯示 tooltip / hint，內容為目標 URL。
- **FR-006**：對話歷史以 **Pinia store + `pinia-plugin-persistedstate`** 持久化；元件不得直接呼叫 `localStorage`，所有讀寫透過 store。
- **FR-007**：對話未開始時，顯示 5 條輪播 hint（rotating carousel），每 3.6 秒自動切換；點擊 hint 文字將其填入 composer 輸入框並移焦點，不自動送出；送出首則訊息後 carousel 隱藏。
- **FR-008**：輸入為空 / 純空白時 disable 送出按鈕；出現非空白字元後 enable。
- **FR-009**：AI thinking / 串流期間送出按鈕顯示 loading 動畫，且阻擋重複送出。
- **FR-010**：使用提供的 Font Size token（xss–9xl）與 Color Palette token（gray/teal/green/yellow/amber/orange/red）作為 SCSS 變數來源；禁止硬寫 hex 或 px 數值。
- **FR-011**：icon 使用 FontAwesome v6（solid 或 regular，依每個 icon 的視覺適配逐一決定）。
- **FR-012**：主要互動元素（送出按鈕、hint carousel、已渲染連結）須具備 `aria-label`。
- **FR-013**：所有資料存取（mock data 載入、matcher）皆封裝於 `src/services/*.ts`，不得在 `.vue` 元件中直接 import mock data。

## Success Criteria（成功指標）

- **SC-001**：5 筆 mock 問題皆能匹配到對應回覆；至少 3 筆離題輸入會回傳 fallback 訊息。
- **SC-002**：人工檢視至少一則同時含 `**bold**` 與 `[link](url)` 的回覆，確認 typewriter 過程與結束後都不會露出原始 markdown。
- **SC-003**：hover 已渲染連結在 500ms 內顯示目標 URL tooltip。
- **SC-004**：送出 3 則訊息後重新整理，3 組 user + assistant 回合依序還原。
- **SC-005**：點擊任一 hint carousel 項目後，輸入框的值與 hint 文字相符，焦點落在輸入框上；手動送出後產生對應的 user 訊息與 assistant 回覆。Carousel 在首則訊息送出後隱藏。
- **SC-006**：送出按鈕視覺與行為皆正確反映 4 種狀態（disabled-empty、enabled-ready、loading-thinking、idle-after），可於一段錄影互動中逐一驗證。
- **SC-007**：通過 lint；單一元件檔案建議 < 300 行；matcher、markdown parser、typewriter 皆可抽為獨立、可測試的模組，並有 Vitest 單元測試覆蓋。
- **SC-008**：所有主要互動元素皆有 `aria-label`；TypeScript strict mode 無錯誤，程式碼中無 `any`。

## Related Modules（相關模組）

- _目前尚無已註冊模組。_ `prospec/ai-knowledge/_index.md` 目前為空 —— 本 Story 將建立第一批模組（預期包括 `chat-ui`、`message-matcher`、`typewriter-renderer`、`history-store`、`services/mock-data`）。於 `/prospec-plan` 與 `/prospec-knowledge-generate` 階段正式定義模組切割。

## Open Questions（待釐清）

- [ ] **NEEDS CLARIFICATION**：Typewriter 速度目標（每秒字數）—— 由設計階段決定或這邊先定 default？
- [ ] **NEEDS CLARIFICATION**：Fuzzy match 分數閾值（低於多少算 fallback）—— 規劃階段給預設值即可。
- [ ] **NEEDS CLARIFICATION**：連結 tooltip 實作（native `title`、Quasar `q-tooltip`、或自製元件）—— 設計階段依 design.pen 決定。
- [ ] **NEEDS CLARIFICATION**：mock data 中的 image URL 是要 inline 顯示圖片，還是維持文字連結？目前預設為文字連結。

## Constitution Check

- [x] 已對照 `prospec/CONSTITUTION.md` 審查
- [x] 無違反原則
  - P1 Traditional Chinese First：proposal 已為繁中
  - P2 Composition API Only：FR-013 / 實作規範確立所有元件使用 `<script setup lang="ts">`
  - P3 Service Layer Encapsulation：FR-013 要求 mock data 與 matcher 位於 `src/services/*.ts`
  - P4 Quasar + SCSS Tokens：FR-010、FR-011 明確要求 token driven、禁止硬寫數值
  - P5 Type Safety：SC-008 要求 TS strict mode 無 `any`
  - Constraint Pinia persist：FR-006 明確指定，並禁止元件直接操作 localStorage
  - Quality（a11y / testing）：FR-012、SC-007、SC-008 已覆蓋

## UI Scope

**Scope：** full

本 Story 交付完整的聊天室畫面（layout、訊息列表、訊息泡泡、composer、suggested chip、loading 狀態）與訊息內渲染（typewriter、樣式化 markdown、連結 hover）。視覺細節由設計規格驅動，本 proposal 界定行為與驗收。
