---
feature: code-quality
title: Code Quality & Vue Idioms
status: active
story_count: 2
req_count: 4
last_updated: 2026-05-11
---

# Feature: Code Quality & Vue Idioms

## Overview

Ensures the codebase follows Vue 3 conventions, maintains a clean `services/` layer (API clients only), removes unused scaffold files, and avoids non-idiomatic workarounds.

---

## US-1: Project Structure & Vue Idiom Cleanup

As a 開發者,
I want 檔案結構符合「services 只放 API 客戶端」原則、Vue 3 template ref 使用正確 API、函式名語意清晰、移除未使用的 scaffold 殘留,
So that 新人閱讀時不受誤導，IDE 無紅底線，codebase 無廢棄雜訊.

**Priority:** P1
**Acceptance Scenarios:**
- WHEN 瀏覽 `src/services/`, THEN 僅剩 `matcher.ts`；`mock-data.ts` 移至 `src/utils/`
- WHEN 查看 `ChatComposer.vue`, THEN 使用 `useTemplateRef<HTMLInputElement>()` + `watch`，TypeScript 紅底線消失
- WHEN 查看 `src/components/` 與 `src/assets/`, THEN scaffold 殘留檔案已刪除

### REQ-STRUCT-001: 建立 utils/ 資料夾並遷移非 API 工具

**Description:** 建立 `src/utils/` 目錄，將非 API 工具檔從 `services/` 遷移至此，確保 `services/` 只存放 API 客戶端層。

**Acceptance Criteria:**
1. `src/utils/` 存在並包含 `mock-data.ts`、`mock-stream.ts`
2. `src/services/` 僅剩 `matcher.ts`；原 `markdown-parser.ts` 已刪除
3. 所有 import 路徑更新，測試通過

**Priority:** High | **Status:** Implemented (2026-05-11)

---

### REQ-STRUCT-002: 刪除 Quasar scaffold 殘留檔案

**Description:** 刪除 Quasar 初始化時產生的未使用元件、靜態資源與對應路由，減少 codebase 雜訊。

**Acceptance Criteria:**
1. 以下檔案已不存在：`EssentialLink.vue`、`quasar-logo-vertical.svg`、`ColorsPage.vue`、`TypographyPage.vue`、`ColorCard.vue`
2. `routes.js` 中 `/colors`、`/typography` 路由已移除
3. 沒有任何其他檔案 import 上述元件

**Priority:** Medium | **Status:** Implemented (2026-05-11)

---

### REQ-CHAT-COMPOSER-001: useTemplateRef + 語意化命名

**Description:** 以 Vue 3.5 `useTemplateRef<HTMLInputElement>()` 取代 callback ref，並將語意衝突的 `onMounted` 函式移除，以 `watch` 處理 ref 掛載後的 emit 邏輯。

**Acceptance Criteria:**
1. `ChatComposer.vue` 使用 `useTemplateRef<HTMLInputElement>('textInput')` 取得文字輸入元素
2. 不存在任何名為 `onMounted` 的自定義函式
3. `inputRef` emit 仍在元素掛載時觸發，行為與修改前相同
4. IDE TypeScript 零錯誤，`:ref` 無紅底線

**Priority:** High | **Status:** Implemented (2026-05-11)

---

## US-2: Transition-Based Animation

As a 開發者,
I want 聊天視窗開關動畫使用標準 `<Transition>` 元件實作，
So that 移除 `style.animation = 'none'` / `offsetHeight` reflow hack.

**Priority:** P1

### REQ-INDEX-PAGE-001: Vue Transition 取代 animation hack

**Description:** 以 Vue 內建 `<Transition name="chat-pop">` 搭配 `v-show` 管理聊天視窗的開關動畫，移除手動 animation restart workaround。

**Acceptance Criteria:**
1. `IndexPage.vue` 不包含 `style.animation = 'none'`、`offsetHeight`、`isClosing` 任何字樣
2. `chatPanelEl` template ref 已移除
3. 開啟動畫（340ms）與關閉動畫（220ms）視覺效果正確
4. `v-show` 保留（不改為 `v-if`），DOM 狀態（對話記錄）不丟失

**Priority:** High | **Status:** Implemented (2026-05-11)

---

## Change History

| Date | Change | REQs Affected |
|------|--------|---------------|
| 2026-05-11 | Initial — refactor-code-quality-and-security | REQ-STRUCT-001, REQ-STRUCT-002, REQ-CHAT-COMPOSER-001, REQ-INDEX-PAGE-001 |
