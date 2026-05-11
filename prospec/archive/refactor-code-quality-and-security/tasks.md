# Tasks：refactor-code-quality-and-security

## Lib

- [x] 將 `src/services/mock-data.ts` 移至 `src/utils/mock-data.ts`；更新 `matcher.ts` import 路徑 ~15 lines
- [x] [P] ~~建立 `src/utils/markdown-parser-utils.ts`~~：改採 `streaming-markdown` library，`findSafeEnd`/`stripIncompleteTail` 不再需要；刪除 `src/services/markdown-parser.ts` ~50 lines
- [x] [P] 建立 `src/utils/mock-stream.ts`：`createMockStream(content: string): AsyncGenerator<string>`（CHUNK_SIZE=3, DELAY_MS=22） ~30 lines
- [x] ~~安裝 `marked`~~；改安裝 `streaming-markdown`；建立 `src/components/MarkdownRenderer.ts`（defineComponent + DOM ref）：`smd.default_renderer` + 自訂 `add_token`/`set_attr` 攔截，strong 加 `.num`、safe link 加 `.link`/`rel`/`target`/`data-tooltip`、unsafe URL DOM swap `<a>` → `<span>`；`partial` prop 控制 `parser_end` 時機；`findSafeEnd` 完全由 library 取代 ~90 lines
- [x] [P] 刪除 `src/components/EssentialLink.vue`、`src/assets/quasar-logo-vertical.svg` ~5 lines

## Services

- [x] 更新 `src/services/matcher.ts`：回傳型別改為 `Promise<{ stream: AsyncIterable<string>, suggestedQuestion: string | null }>`；先解析 suggestedQuestion，再以 `createMockStream(content)` 建立串流；從 `src/types/chat.ts` 移除 `MatchResult` 的對外 export ~35 lines
- [x] 更新 `src/stores/chat.ts` `sendMessage`：以 `for await (const chunk of stream)` 累加 `turn.assistant.content`；串流結束後 `isThinking.value = false`（取代由 TypewriterText 驅動的 markThinkingDone 呼叫路徑） ~40 lines

## Components

- [x] 刪除 `src/pages/ColorsPage.vue`、`src/pages/TypographyPage.vue`、`src/components/ColorCard.vue`；移除 `src/router/routes.js` 中 `/colors`、`/typography` 路由 ~10 lines
- [x] 更新 `src/components/ChatComposer.vue`：以 `useTemplateRef<HTMLInputElement>('textInput')` 取代 callback ref；以 `watch(textInput, el => emit('inputRef', el))` 替代 `onMounted` 函式；移除 `onMounted` callback 定義 ~25 lines
- [x] 重構 `src/pages/IndexPage.vue`：以 `<Transition name="chat-pop">` 包裹 `v-show="isOpen"` 的 `.chat-wrap`；新增 `.chat-pop-enter-active .chat` / `.chat-pop-leave-active .chat` CSS 規則；移除 `isClosing`、`chatPanelEl`、`openWidget`/`closeWidget` 中的 animation hack ~45 lines
- [x] 更新 `src/components/ChatBubble.vue`：靜態 AI 訊息由 `v-html` 改為 `<MarkdownRenderer :content="content" />`；移除 `useChatStore` import 與 `onDone` 函式；新增 `watch(props.animate, (val, old) => { if (old && !val) emit('animationDone') })` ~35 lines
- [x] 更新 `src/components/TypewriterText.vue`：保留 timer（供 suggested question typewriter 效果）；新增 `streaming?: boolean` prop；`streaming=true` 時直接渲染 `<MarkdownRenderer :content="props.content" :partial="true" />`（SSE 驅動，無 timer）；`streaming=false` 保留 timer 逐字推進 `visibleContent`；移除 `done` emit 由 ChatBubble `watch(animate)` 取代 ~20 lines

## Tests

- [x] 將 `src/tests/markdown-parser.spec.ts` 改寫為 MarkdownRenderer 測試：驗證 `javascript:` URL 降級純文字、`data:` URL 降級、合法 link 含 `rel="noopener noreferrer"`、streaming partial 安全（不暴露 `**` 或 `[`）、bold 渲染為 `.num` ~70 lines
- [x] 更新 `src/tests/chat-store.spec.ts`：mock `matcher` 改回傳 `{ stream: asyncGenerator(['chunk1', 'chunk2']), suggestedQuestion }`；新增驗證 `turn.assistant.content` 逐 chunk 累加；驗證串流結束後 `isThinking = false` ~50 lines
- [x] [P] 更新 `src/tests/chat-composer.spec.ts`：確認 `useTemplateRef` 重構後 `inputRef` emit 行為不變 ~25 lines

## Summary

- **Total Tasks:** 15
- **Parallelizable Tasks:** 4
- **Total Estimated Lines:** ~545 lines
