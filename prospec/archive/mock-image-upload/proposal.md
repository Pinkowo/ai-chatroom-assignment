# Proposal：mock-image-upload

## Background

ChatComposer 目前的附件按鈕（`fa-paperclip`）僅為樣式佔位，點擊無任何反應。為展示 QA chatbot 的多媒體互動潛力，需在前端完整模擬圖片上傳流程：選圖 → 預覽 → 假送出 → 顯示於對話中，全程不涉及真實後端。

## User Stories

### US-1：開啟圖片選擇器並預覽 [P1]

As a 訪客使用者，
I want 點擊附件按鈕後能選取本機圖片並在 Composer 看到預覽縮圖，
So that 確認選到正確圖片再送出。

**Acceptance Scenarios:**

- WHEN 使用者點擊附件按鈕，THEN 瀏覽器原生 file picker 開啟（僅接受 image/*）
- WHEN 使用者選取一張圖片，THEN Composer 輸入列顯示圖片縮圖預覽（最大 48px 高）
- WHEN 使用者點擊預覽縮圖上的 ✕，THEN 預覽清除，附件狀態重置
- WHEN 使用者取消 file picker 未選檔案，THEN Composer 狀態不變

**Independent Test:**
點擊附件按鈕 → 選擇任一圖片 → Composer 出現縮圖 → 點 ✕ → 縮圖消失。

---

### US-2：附圖假送出並顯示於對話 [P1]

As a 訪客使用者，
I want 按下送出後圖片以訊息泡泡形式出現在對話中並收到 AI 回覆，
So that 體驗完整的圖片訊息流程。

**Acceptance Scenarios:**

- WHEN 使用者在選好圖片後按送出，THEN 對話中出現使用者訊息泡泡，內含圖片縮圖（最大寬 240px）
- WHEN 圖片訊息送出後，THEN AI 以固定 mock 回覆回應（例："收到你的圖片！目前我還無法分析圖片內容。"）
- WHEN 圖片訊息送出後，THEN Composer 預覽清除、輸入框保持空白
- WHEN 使用者同時有文字與附圖，THEN 圖片與文字均顯示於同一使用者泡泡中

**Independent Test:**
選圖後按送出 → 對話出現圖片泡泡 → AI 回覆出現 → Composer 清空。

---

## Edge Cases

- **非圖片檔案**：file picker 以 `accept="image/*"` 限制，不另行 MIME 驗證
- **檔案過大（>5MB）**：顯示錯誤提示 "圖片太大，請選擇 5MB 以內的圖片"，不清除現有預覽
- **同時選多張**：僅接受單張（`multiple` 屬性不開放）
- **送出時僅有圖片無文字**：允許，圖片單獨作為訊息送出

## Functional Requirements

- **FR-001**：附件按鈕觸發隱藏的 `<input type="file" accept="image/*">`，不使用第三方 library
- **FR-002**：選圖後以 `URL.createObjectURL()` 產生預覽 URL，元件 unmount 時呼叫 `URL.revokeObjectURL()` 釋放記憶體
- **FR-003**：圖片訊息的 `Message` 型別新增 `imageUrl?: string` 欄位
- **FR-004**：`ChatBubble` 支援渲染 `imageUrl`，圖片以 `<img>` 顯示，`max-width: 240px`、`border-radius: 8px`
- **FR-005**：`chat store` 的 `sendMessage` 接受可選 `imageUrl` 參數並傳入 turn
- **FR-006**：圖片 mock 回覆為固定字串，透過 `matcher` 的 fallback 機制處理（不新增 mock key）
- **FR-007**：`ChatComposer` 送出後呼叫 `URL.revokeObjectURL()` 清理預覽

## Success Criteria

- **SC-001**：點擊附件按鈕可選圖，選圖後 Composer 顯示預覽縮圖
- **SC-002**：按送出後對話出現含圖片的使用者泡泡
- **SC-003**：AI 回覆固定為圖片相關 mock 字串，typewriter 動畫正常運作
- **SC-004**：元件 unmount 後無 object URL 記憶體洩漏（`revokeObjectURL` 被呼叫）
- **SC-005**：超過 5MB 圖片顯示錯誤提示，不中斷 UI

## Related Modules

- **chat-ui（ChatComposer）**：需新增 file input、預覽縮圖、清除按鈕
- **chat-rendering（ChatBubble）**：需支援 `imageUrl` 渲染
- **chat-core（store / types）**：`Message` 型別與 `sendMessage` 擴充

## Open Questions

- [x] 圖片不需要點擊放大（lightbox）。
- [x] AI 根據文字內容回覆，圖片不影響回覆邏輯，不需要專屬 mock 回覆。

## Constitution Check

- [x] Vue Composition API Only — `<script setup lang="ts">` 全程使用
- [x] Service Layer Encapsulation — 圖片 mock 回覆透過 matcher fallback，不在元件內寫死
- [x] Type Safety — `Message.imageUrl?: string` 明確型別，無 `any`
- [x] Quasar + SCSS Tokens — 預覽縮圖尺寸使用 token，不寫死 px

## UI Scope

**Scope:** partial
