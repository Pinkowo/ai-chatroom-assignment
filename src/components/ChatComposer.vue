<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useChatStore } from 'src/stores/chat'

const emit = defineEmits<{ (e: 'inputRef', el: HTMLInputElement | null): void }>()

const store = useChatStore()
const inputEl = ref<HTMLInputElement | null>(null)
const localValue = ref(store.pendingInput)

watch(() => store.pendingInput, (val) => {
  localValue.value = val
})

const hasContent = computed(() => localValue.value.trim().length > 0)
const isLoading = computed(() => store.isThinking)
const isDisabled = computed(() => !hasContent.value || isLoading.value)

function handleSubmit(): void {
  if (isDisabled.value) return
  store.sendMessage(localValue.value)
  localValue.value = ''
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

function onMounted(el: HTMLInputElement | null): void {
  inputEl.value = el
  emit('inputRef', el)
}

defineExpose({ inputEl })
</script>

<template>
  <div class="chat-input">
    <input
      :ref="onMounted"
      v-model="localValue"
      class="chat-input__field"
      type="text"
      placeholder="Say something..."
      :disabled="isLoading"
      aria-label="Message input"
      @keydown="handleKeydown"
    />
    <div class="chat-input__actions">
      <button
        class="chat-input__attach"
        type="button"
        aria-label="Attach file"
      >
        <i class="fa-solid fa-paperclip" aria-hidden="true" />
      </button>
      <button
        class="chat-input__send"
        :class="{
          'chat-input__send--disabled': !hasContent && !isLoading,
          'chat-input__send--loading': isLoading,
        }"
        type="button"
        :disabled="isDisabled"
        :aria-label="isLoading ? 'Sending' : 'Send message'"
        @click="handleSubmit"
      >
        <svg v-if="isLoading" class="chat-input__ring" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
        </svg>
        <i v-else class="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-input {
  border-top: 1px solid $gray-100;
  height: 68px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 25px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  flex-shrink: 0;

  &__field {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font: 400 16px/24px 'Source Sans 3', 'Source Sans Pro', sans-serif;
    color: var(--text);
    padding: 0;

    &::placeholder {
      color: var(--text-muted);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
  }

  &__attach {
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 20px;
    display: grid;
    place-items: center;
    padding: 0;
    transition: color 0.15s;

    &:hover {
      color: var(--text);
    }
  }

  &__send {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: $teal-700;
    color: #fff;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    font-size: 14px;
    transition: background 0.15s, transform 0.15s;

    &:hover:not(:disabled) {
      transform: scale(1.06);
    }

    &--disabled,
    &--loading {
      background: $gray-500;
      cursor: not-allowed;
    }
  }

  &__ring {
    display: block;
    width: 18px;
    height: 18px;

    circle {
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: 56.55;
      stroke-dashoffset: 56.55;
      transform-origin: 12px 12px;
      transform: rotate(-90deg);
      animation: ring-stroke 1.4s ease-in-out infinite;
    }
  }
}

@keyframes ring-stroke {
  0%   { stroke-dashoffset: 56.55; }
  45%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -56.55; }
}

.motion-off .chat-input__ring circle {
  animation: none;
  stroke-dashoffset: 0;
}
</style>
