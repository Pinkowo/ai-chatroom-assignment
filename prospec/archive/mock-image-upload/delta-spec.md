# Delta Spec：mock-image-upload

## ADDED

### REQ-IMG-TYPE-001: Message 型別擴充

**Feature:** image-upload
**Story:** US-2

**Description:**
`Message` 介面新增 `imageUrl?: string` 欄位，用於攜帶使用者訊息中的本機圖片 Blob URL。

**Acceptance Criteria:**
1. `Message.imageUrl` 為 `string | undefined`，無 `any`
2. 現有程式碼不需修改（可選欄位向下相容）

**Priority:** High

---

### REQ-IMG-COMPOSER-001: ChatComposer 圖片選取與預覽

**Feature:** image-upload
**Story:** US-1

**Description:**
Attach 按鈕觸發隱藏的 `<input type="file" accept="image/*">`；選圖後以 `URL.createObjectURL()` 產生預覽並顯示於 Composer 輸入列；預覽含 ✕ 清除按鈕；超過 5MB 顯示錯誤提示。元件 unmount 時呼叫 `revokeObjectURL` 釋放記憶體。

**Acceptance Criteria:**
1. 點擊 attach 按鈕觸發 file picker，`accept="image/*"`，`multiple` 不開啟
2. 選圖後 Composer 顯示縮圖預覽（max-height 48px），旁有 ✕ 按鈕
3. 點擊 ✕ 清除預覽，呼叫 `revokeObjectURL`
4. 檔案 > 5MB 時顯示錯誤文字，不產生預覽
5. 取消 file picker 未選檔，Composer 狀態不變
6. 元件 unmount 時若 previewUrl 存在，呼叫 `revokeObjectURL`

**Priority:** High

---

### REQ-IMG-COMPOSER-002: ChatComposer 送出整合

**Feature:** image-upload
**Story:** US-2

**Description:**
送出時將 `previewUrl` 作為 `imageUrl` 傳入 `store.sendMessage`；送出後立即呼叫 `revokeObjectURL` 並清空預覽。僅有圖片無文字時，`hasContent` 仍為 `true`，允許送出。

**Acceptance Criteria:**
1. `hasContent` computed 在 `previewUrl` 存在時回傳 `true`（即使文字為空）
2. 送出後 `previewUrl` 清空，`revokeObjectURL` 被呼叫
3. 送出後 file input 的 value 重置，允許重複選同一張圖

**Priority:** High

---

### REQ-IMG-STORE-001: chat store sendMessage 擴充

**Feature:** image-upload
**Story:** US-2

**Description:**
`sendMessage(text, imageUrl?)` 新增可選第二參數。允許條件從「trimmed 非空」放寬為「trimmed 非空 OR imageUrl 有值」。imageUrl 存入 `turn.user`。

**Acceptance Criteria:**
1. `sendMessage(text: string, imageUrl?: string)` 型別正確
2. `(!trimmed && !imageUrl)` 時早期返回，不送出
3. `imageUrl` 存入 `turn.user.imageUrl`
4. 無文字時以空字串進 matcher，回傳 fallback 回覆

**Priority:** High

---

### REQ-IMG-BUBBLE-001: User Bubble 圖片渲染

**Feature:** image-upload
**Story:** US-2

**Description:**
`IndexPage.vue` 的 user bubble template 在 `turn.user.imageUrl` 存在時渲染 `<img>`，置於文字之上。

**Acceptance Criteria:**
1. `imageUrl` 存在時，bubble 顯示 `<img>`，max-width 240px，border-radius 8px
2. `imageUrl` 不存在時，bubble 渲染與現有行為完全相同
3. `<img>` 具有 `alt="attached image"` aria 屬性

**Priority:** High

---
