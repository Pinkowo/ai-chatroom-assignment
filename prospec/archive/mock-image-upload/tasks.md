# Tasks：mock-image-upload

## Types

- [x] 擴充 `Message` 介面，新增 `imageUrl?: string` ~5 lines

## Store

- [x] 擴充 `sendMessage(text, imageUrl?)` 簽名，放寬送出條件，imageUrl 寫入 turn.user ~20 lines

## Components

- [x] ChatComposer：新增隱藏 file input，attach 按鈕觸發 click ~15 lines
- [x] ChatComposer：選圖後 createObjectURL → previewUrl ref，5MB 驗證與 errorMsg ~25 lines
- [x] ChatComposer：預覽縮圖 UI（max-height 48px）與 ✕ 清除按鈕，revokeObjectURL ~30 lines
- [x] ChatComposer：`hasContent` 納入 previewUrl，送出後 revoke + 清空，file input value 重置 ~20 lines
- [x] ChatComposer：onUnmounted 清理 previewUrl revokeObjectURL ~5 lines
- [x] IndexPage：user bubble 條件渲染 `<img>`（max-width 240px、border-radius、alt） ~15 lines

## Tests

- [x] [P] chat-store：測試 sendMessage with imageUrl，imageUrl 寫入 turn.user ~30 lines
- [x] [P] chat-store：測試空文字 + imageUrl 允許送出；空文字 + 無圖早期返回 ~20 lines
- [x] [P] ChatComposer：測試選圖後 previewUrl 設定、5MB 拒絕、✕ 清除 ~50 lines

## Summary

- **Total Tasks:** 11
- **Parallelizable Tasks:** 3
- **Total Estimated Lines:** ~235 lines
