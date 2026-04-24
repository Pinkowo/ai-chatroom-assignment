# Plan：mock-image-upload

## Overview

使用者目前無法與附件按鈕互動，點擊無反應。本 Story 為 ChatComposer 的 `fa-paperclip` 按鈕實作完整的圖片選取 → 預覽 → 假送出流程，讓 QA Chatbot 展示多媒體互動能力。

策略上採最小侵入原則：新增 `Message.imageUrl?: string` 欄位，`sendMessage` 增加可選參數，ChatComposer 使用隱藏 `<input type="file">` 實作選圖，IndexPage 的 user bubble 條件渲染圖片。AI 回覆邏輯不變，依文字部分 fuzzy match；圖片不影響 matcher。

## Technical Context (Greenfield)

> AI Knowledge 模組尚未建立，以直接掃描原始碼作為替代

### 受影響檔案
| 檔案 | 職責 | 擬變更 |
|------|------|--------|
| `src/types/chat.ts` | 全域型別定義 | Message 加 imageUrl 欄位 |
| `src/stores/chat.ts` | 對話狀態與 sendMessage | 接受 imageUrl 可選參數 |
| `src/components/ChatComposer.vue` | 輸入列 UI | 圖片選取、預覽、清除、送出 |
| `src/pages/IndexPage.vue` | 頁面組裝、user bubble | 條件渲染 img 標籤 |

### 現有慣例
- 元件一律 `<script setup lang="ts">`，無 Options API
- 外部資料存取透過 `src/services/*.ts`（圖片為本機 Blob，不需 service）
- `URL.createObjectURL` / `URL.revokeObjectURL` 配對使用，防記憶體洩漏

## Affected Modules

| Module | Impact | Changes |
|--------|--------|---------|
| types/chat | Low | Message 介面新增 `imageUrl?: string` |
| stores/chat | Medium | sendMessage 增加 imageUrl 可選參數，空文字+有圖時允許送出 |
| ChatComposer | High | file input、預覽縮圖、大小驗證、清除、送出整合 |
| IndexPage | Low | user bubble 條件渲染 `<img>` |

## Implementation Steps

1. **擴充 Message 型別**
   - `imageUrl?: string` 加入 `Message` 介面

2. **擴充 store.sendMessage**
   - 簽名改為 `sendMessage(text: string, imageUrl?: string): Promise<void>`
   - 允許條件：`trimmed || imageUrl`（有圖無文字亦可送出）
   - 無文字時以空字串進 matcher，回傳 fallback 回覆

3. **ChatComposer 圖片選取與預覽**
   - 隱藏 `<input type="file" accept="image/*">` 綁定 attach 按鈕
   - 選圖後 `URL.createObjectURL(file)` → `previewUrl` ref
   - 驗證 `file.size > 5MB`：顯示 `errorMsg` ref，不產生預覽
   - 預覽縮圖（max-height 48px）含 ✕ 清除按鈕，清除時 `revokeObjectURL`
   - `hasContent` computed 同時考慮文字與 previewUrl

4. **ChatComposer 送出整合**
   - `handleSubmit` 呼叫 `store.sendMessage(text, previewUrl.value ?? undefined)`
   - 送出後立即 `revokeObjectURL(previewUrl.value)`，清空 previewUrl

5. **IndexPage user bubble 渲染圖片**
   - user bubble template 在 `turn.user.imageUrl` 存在時插入 `<img>`
   - max-width 240px、border-radius 8px、display block

6. **Unit tests**
   - ChatComposer：file select → previewUrl、大小驗證、清除、送出
   - chat-store：sendMessage with imageUrl 正確寫入 turn

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Object URL 未釋放 | Low | onUnmounted + 送出後立即 revoke，測試覆蓋 |
| 空文字 + 有圖送出時 matcher 回 fallback | Low | 已知行為，符合「根據文字回覆」規格 |
| 手機 file picker 差異 | Low | 純 demo，`accept="image/*"` 由瀏覽器處理 |
