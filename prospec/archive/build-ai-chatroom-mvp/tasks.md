# Tasks：build-ai-chatroom-mvp（UI Redesign）

## Types

- [x] 清理 `src/types/chat.ts`：從 `MockResponse` 移除 `suggestedQuestion` 欄位；確認 `ConversationTurn` 無殘留欄位 ~10 lines

## Services

- [x] 更新 `src/services/mock-data.ts`：移除 `suggestedQuestion` 解析邏輯，`MockResponse` 僅保留 `{ content: string }`；確認 matcher / store 仍正常呼叫 ~30 lines

## CSS

- [x] [P] 確認 / 補充 `src/css/quasar.variables.scss`：`$teal-700: #264d4f`、`$teal-300: #64b1b5`、`$teal-100: #a9d4d6`、`$gray-0: #f4f5f6`、`$orange-400: #fb7429`；設定 CSS custom properties（`--brand`、`--bubble-ai`、`--bubble-user` 等）~20 lines

## Components（新建）

- [x] [P] 新建 `src/components/Launcher.vue`：`position: fixed; right: 30px; bottom: 30px`；`137×36px; border-radius: 18px; $orange-400` bg；FA `fa-wand-magic-sparkles`（12px white）+ label "Ask Nitra AI"（Inter 14px/600）；hover `translateY(-1px) brightness(1.05)`；click → `$emit('toggle')`；`aria-label="Ask Nitra AI"` ~50 lines
- [x] [P] 新建 `src/components/ChatHeader.vue`：`$teal-700` bg；`border-radius: 8px 8px 0 0`；padding `18px 20px`；Nitra logo SVG（46×23px，white fill，margin-top 7px）+ h1 "Nitra AI"（Source Sans 3 30px/700）+ `fa-wand-magic-sparkles`（24px）+ subtitle "Hi there, How can we help?"（16px/400）；關閉按鈕（`28×28px`，`fa-xmark`，`position: absolute; top: 14px; right: 14px`，hover `rgba(255,255,255,0.12)`）；emit `close` ~60 lines
- [x] [P] 新建 `src/components/ThinkingBubble.vue`：AI-style bubble（`$gray-0` bg，`0 10px 10px 10px` radius，padding `14px 18px`）；3×`7×7px` 圓點（`$gray-600`）；`dot` keyframe（translateY 0→-4px→0，opacity 0.5→1→0.5，1.3s ease-in-out infinite；stagger +0.15s / +0.3s）；帶 24×24 Nitra avatar ~40 lines
- [x] [P] 新建 `src/components/HintCarousel.vue`：5 條靜態 hint（FA icon + text，見 design-spec）；3600ms `setInterval` 自動輪播；`hint-exit`（translateY 0→-22px，opacity→0，0.45s）＋`hint-enter`（translateY 22→0，opacity→1，0.45s）；icon 色 `$teal-300`；text 色 `#5c6970`，hover `$teal-700`；click → `$emit('select', hint.text)`；`v-show` 由 `hasMessages` prop 控制；motion-off 模式無動畫（直接切換） ~80 lines
- [x] [P] 新建 `src/components/LinkTooltip.vue`：body-level `teleport`（或手動 `document.body.appendChild`）；`position: fixed; z-index: 9999; pointer-events: none`；`getBoundingClientRect` 定位，clamp 至 viewport 邊緣；background `rgba(13,8,44,0.88)`；opacity 0→1 `0.12s transition`；props `text: string; x: number; y: number; visible: boolean` ~60 lines

## Components（更新）

- [x] 重構 `src/components/ChatBubble.vue`：AI bubble → `$gray-0` bg、`border-radius: 0 10px 10px 10px`、24×24 Nitra avatar SVG；User bubble → `$teal-100` bg、`border-radius: 10px 0 10px 10px`、`padding-right: 90px`；streaming caret `▍` via `::after` pseudo（`$teal-700`，1s `steps(2)` blink）；`slide` keyframe 入場（translateY 8→0，opacity 0→1，0.32s）；link `$orange-400` underline；click link → `$emit('link-click', href)` ~70 lines
- [x] 重構 `src/components/ChatComposer.vue`：borderless transparent input（Source Sans 3 16px，placeholder `--text-muted`；disabled `cursor: not-allowed`）；圓形 send button（`36×36px; border-radius: 50%`；enabled: `$teal-700` bg + `fa-chevron-right`；loading: `$gray-500` bg + SVG ring `stroke-dashoffset 56.55→0→-56.55, 1.4s infinite`；disabled: `$gray-500`）；attach button（`20×20px; fa-paperclip; $gray-500`）；InputArea `border-top: 1px solid $gray-100; height: 68px` ~70 lines
- [x] 刪除 `src/components/SuggestedChip.vue`；清理所有 import 及樣板引用 ~15 lines

## Page

- [x] 重寫 `src/pages/IndexPage.vue` 為 ChatWidget：Launcher（`position: fixed; right: 30px; bottom: 30px`）+ ChatWindow（`position: fixed; right: 30px; bottom: 78px; width: 780px; height: 591px; border-radius: 8px; box-shadow: 0 30px 60px rgba(38,77,79,0.25)`）；`isOpen` ref 控制顯示；`pop` keyframe（scale 0.94→1，opacity 0→1，0.34s，`transform-origin: bottom right`）/ `popOut` keyframe（0.22s）；組合 ChatHeader / ChatBody（MessageRow + ThinkingBubble + HintCarousel）/ ChatComposer；mount LinkTooltip；`@select` 處理 hint 填入 composer input + focus；新訊息 scrollIntoView；≤840px `right/left: 12px; height: calc(100vh - 84px)` ~130 lines

## Tests

- [x] [P] 新增 `src/tests/hint-carousel.spec.ts`：無 user message 時 carousel 可見且含 5 條 hint；click hint → emit `select` 事件含正確文字；`hasMessages: true` 時 carousel 隱藏；motion-off prop 下無動畫 class ~60 lines
- [x] [P] 刪除 `src/tests/suggested-chip.spec.ts`；更新 `src/tests/chat-store.spec.ts`（移除 suggestedQuestion assertions；確認 `fillComposer` action 仍更新 `pendingInput`）~30 lines

## Summary

- **Total Tasks:** 14
- **Parallelizable Tasks:** 8
- **Total Estimated Lines:** ~725 lines
