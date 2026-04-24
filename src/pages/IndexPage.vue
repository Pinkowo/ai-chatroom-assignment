<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useChatStore } from 'src/stores/chat'
import type { ConversationTurn } from 'src/types/chat'
import Launcher from 'src/components/Launcher.vue'
import ChatHeader from 'src/components/ChatHeader.vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import ThinkingBubble from 'src/components/ThinkingBubble.vue'
import HintCarousel from 'src/components/HintCarousel.vue'
import ChatComposer from 'src/components/ChatComposer.vue'

const store = useChatStore()

const isOpen = ref(false)
const isClosing = ref(false)
const welcomeAnimated = ref(false)
const chatBodyEl = ref<HTMLElement | null>(null)
const chatPanelEl = ref<HTMLElement | null>(null)
const composerInputEl = ref<HTMLInputElement | null>(null)

function openWidget(): void {
  isOpen.value = true
  isClosing.value = false
  // 重新觸發 pop 動畫（v-show 保留 DOM，需手動 reset animation）
  nextTick(() => {
    if (chatPanelEl.value) {
      chatPanelEl.value.style.animation = 'none'
      void chatPanelEl.value.offsetHeight // force reflow
      chatPanelEl.value.style.animation = ''
    }
  })
}

function closeWidget(): void {
  isClosing.value = true
  setTimeout(() => {
    isOpen.value = false
    isClosing.value = false
  }, 220)
}

function onToggle(): void {
  if (isOpen.value) {
    closeWidget()
  } else {
    openWidget()
  }
}

function onInputRef(el: HTMLInputElement | null): void {
  composerInputEl.value = el
}

function onHintSelect(text: string): void {
  store.fillComposer(text)
  nextTick(() => composerInputEl.value?.focus())
}

const userScrolledUp = ref(false)

function scrollToBottom(): void {
  if (!chatBodyEl.value) return
  chatBodyEl.value.scrollTop = chatBodyEl.value.scrollHeight
}

// deltaY < 0 = 向上滾 → 鎖定自動捲動
function onChatBodyWheel(e: WheelEvent): void {
  if (e.deltaY < 0) userScrolledUp.value = true
}

// 使用者滾回接近底部（≤20px）→ 解除鎖定
// rAF 鎖住時不會有 programmatic scroll，此時 scroll 事件只來自使用者，不會誤觸
function onChatBodyScroll(): void {
  if (!chatBodyEl.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatBodyEl.value
  if (scrollHeight - scrollTop - clientHeight <= 20) {
    userScrolledUp.value = false
  }
}

// Track which turn's suggested question bubble is currently animating
const suggestedAnimateTurnId = ref<string | null>(null)

function onMainBubbleDone(turn: ConversationTurn): void {
  if (turn.suggestedQuestion) {
    suggestedAnimateTurnId.value = turn.user.id
  }
}

function onSuggestedBubbleDone(): void {
  suggestedAnimateTurnId.value = null
}

// While isThinking OR suggested question is animating, keep scrolling on
// every animation frame so new characters stay in view.
let scrollRafId: number | null = null

function startScrollLoop(): void {
  if (!userScrolledUp.value) scrollToBottom()
  if (store.isThinking || suggestedAnimateTurnId.value !== null) {
    scrollRafId = requestAnimationFrame(startScrollLoop)
  }
}

function stopScrollLoop(): void {
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId)
    scrollRafId = null
  }
}

watch(() => store.isThinking, (thinking) => {
  if (thinking) {
    startScrollLoop()
  } else {
    stopScrollLoop()
    if (!userScrolledUp.value) nextTick(scrollToBottom)
  }
})

watch(suggestedAnimateTurnId, (id) => {
  if (id) {
    startScrollLoop()
  } else {
    stopScrollLoop()
    if (!userScrolledUp.value) nextTick(scrollToBottom)
  }
})

// New turn = user just sent — always scroll to bottom and unlock auto-scroll
watch(() => store.turns.length, () => {
  userScrolledUp.value = false
  nextTick(scrollToBottom)
})

onUnmounted(stopScrollLoop)

function isLatestTurn(index: number): boolean {
  return index === store.turns.length - 1
}

function shouldAnimate(index: number): boolean {
  return isLatestTurn(index) && store.isThinking
}
</script>

<template>
  <q-page class="chat-widget-page">
  <div class="chat-widget">
    <Launcher @toggle="onToggle" />

    <div
      v-show="isOpen || isClosing"
      class="chat-wrap"
      :class="{ 'chat-wrap--closing': isClosing }"
    >
      <div ref="chatPanelEl" class="chat" role="dialog" aria-label="Nitra AI">
        <ChatHeader @close="closeWidget" />

        <div ref="chatBodyEl" class="chat-body" @wheel.passive="onChatBodyWheel" @scroll.passive="onChatBodyScroll">
          <!-- Welcome message — animates on every open, matching design.html WELCOME boot message -->
          <ChatBubble
            role="assistant"
            content="Welcome to Nitra AI!"
            :animate="!welcomeAnimated"
            @animation-done="welcomeAnimated = true"
          />

          <template v-for="(turn, idx) in store.turns" :key="turn.user.id">
            <!-- User message -->
            <div class="msg msg--user">
              <div class="msg__bubble msg__bubble--user">
                <img
                  v-if="turn.user.imageUrl"
                  :src="turn.user.imageUrl"
                  class="msg__bubble-image"
                  alt="attached image"
                />
                <span v-if="turn.user.content">{{ turn.user.content }}</span>
              </div>
            </div>

            <!-- Thinking indicator -->
            <ThinkingBubble
              v-if="isLatestTurn(idx) && store.isThinking && !turn.assistant.content"
            />

            <!-- AI response -->
            <ChatBubble
              v-else-if="turn.assistant.content"
              role="assistant"
              :content="turn.assistant.content"
              :animate="shouldAnimate(idx)"
              @animation-done="onMainBubbleDone(turn)"
            />

            <!-- Suggested question — second bubble, shown after streaming completes -->
            <ChatBubble
              v-if="turn.suggestedQuestion && turn.assistant.content && !(isLatestTurn(idx) && store.isThinking)"
              role="assistant"
              :content="turn.suggestedQuestion"
              :animate="suggestedAnimateTurnId === turn.user.id"
              @animation-done="onSuggestedBubbleDone"
            />
          </template>

          <HintCarousel
            :has-messages="store.turns.length > 0"
            @select="onHintSelect"
          />
        </div>

        <ChatComposer @input-ref="onInputRef" />
      </div>
    </div>
  </div>
  </q-page>
</template>

<style scoped lang="scss">
.chat-widget-page {
  background: $gray-0;
  min-height: 100vh;
}

.chat-widget {
  // Root — no layout needed; children are fixed
}

.chat-wrap {
  position: fixed;
  right: 30px;
  bottom: 78px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.chat {
  width: 780px;
  height: 591px;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
  animation: chat-pop 0.34s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

.chat-wrap--closing .chat {
  animation: chat-pop-out 0.22s ease forwards;
}

.chat-body {
  flex: 1;
  background: #fff;
  padding: 32px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-100;
    border-radius: 3px;
  }
}

.msg {
  display: flex;
  gap: 10px;
  max-width: 100%;
  animation: msg-slide 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;

  &--user {
    justify-content: flex-end;
    padding: 0 0 0 90px;
  }

  &__bubble {
    padding: 10px 16px;
    font: 400 16px/1.4 'Inter', sans-serif;
    color: var(--text);
    word-wrap: break-word;
    max-width: calc(100% - 40px);

    &--user {
      background: var(--bubble-user);
      border-radius: 10px 0 10px 10px;
      color: var(--text);
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }

  &__bubble-image {
    max-width: 240px;
    border-radius: 8px;
    display: block;
  }
}

@keyframes msg-slide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes chat-pop {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes chat-pop-out {
  to {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
}

@media (max-width: 840px) {
  .chat-wrap {
    right: 12px;
    bottom: 70px;
    left: 12px;
    align-items: stretch;
  }

  .chat {
    width: 100%;
    height: calc(100vh - 84px);
  }

  .msg--user {
    padding-right: 20px;
  }
}
</style>
