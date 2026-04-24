<script setup lang="ts">
import { ref } from "vue";
import TypewriterText from "src/components/TypewriterText.vue";
import LinkTooltip from "src/components/LinkTooltip.vue";
import { useChatStore } from "src/stores/chat";
import { renderFull } from "src/services/markdown-parser";

const props = defineProps<{
  role: "user" | "assistant";
  content: string;
  animate?: boolean;
}>();

const emit = defineEmits<{ (e: "animationDone"): void }>();

const store = useChatStore();

const tooltipText = ref("");
const tooltipAnchor = ref<HTMLElement | null>(null);
const tooltipVisible = ref(false);

function onDone(): void {
  store.markThinkingDone();
  emit("animationDone");
}

function onMouseOver(e: MouseEvent): void {
  const a = (e.target as HTMLElement).closest<HTMLElement>("a[data-tooltip]");
  if (!a) return;
  tooltipText.value = a.dataset.tooltip ?? "";
  tooltipAnchor.value = a;
  tooltipVisible.value = true;
}

function onMouseOut(e: MouseEvent): void {
  if ((e.target as HTMLElement).closest("a[data-tooltip]")) {
    tooltipVisible.value = false;
  }
}
</script>

<template>
  <div class="msg" :class="role === 'user' ? 'msg--user' : 'msg--ai'">
    <!-- AI avatar -->
    <div v-if="role === 'assistant'" class="msg__avatar" aria-hidden="true">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="12" />
        <path
          d="M15.9996 16C9.56054 15.9815 11.6313 12.0053 8.00031 12.0001V8C13.5092 8.00801 12.0242 11.9942 15.9996 11.9999V15.9998V16Z"
          fill="white"
        />
        <path d="M20 8H15.9997V11.9999H20V8Z" fill="white" />
        <path d="M8.00033 11.9999H4V15.9998H8.00033V11.9999Z" fill="white" />
      </svg>
    </div>

    <!-- Bubble -->
    <div
      class="msg__bubble"
      :class="[
        role === 'user' ? 'msg__bubble--user' : 'msg__bubble--ai ai-response',
      ]"
      @mouseover="onMouseOver"
      @mouseout="onMouseOut"
    >
      <template v-if="role === 'user'">{{ content }}</template>
      <template v-else>
        <TypewriterText v-if="animate" :content="content" @done="onDone" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-else v-html="renderFull(content)" />
      </template>
    </div>

    <LinkTooltip
      :text="tooltipText"
      :anchor-el="tooltipAnchor"
      :visible="tooltipVisible"
    />
  </div>
</template>

<style scoped lang="scss">
.msg {
  display: flex;
  gap: 10px;
  max-width: 100%;
  animation: msg-slide 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;

  &--user {
    justify-content: flex-end;
  }

  &--ai {
    padding-right: 120px;
  }

  &__avatar {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: 6px;

    circle { fill: $teal-700; }
  }

  &__bubble {
    padding: 10px 16px;
    font:
      400 16px/1.4 "Inter",
      sans-serif;
    color: var(--text);
    letter-spacing: 0.5px;
    word-wrap: break-word;
    max-width: calc(100% - 40px);

    &--ai {
      background: var(--bubble-ai);
      border-radius: 0 10px 10px 10px;
      white-space: pre-wrap;
    }

    &--user {
      background: var(--bubble-user);
      border-radius: 10px 0 10px 10px;
      color: var(--text);
      max-width: 100%;
    }
  }
}

// ai-response content styles — applies to both TypewriterText and static v-html
.ai-response {
  :deep(.num) {
    font-weight: 700;
  }

  :deep(a.link) {
    color: $orange-400;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;

    &:hover {
      text-decoration: none;
    }
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

.motion-off .msg {
  animation: none;
}
</style>
