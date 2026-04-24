<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useChatStore } from 'src/stores/chat'

const emit = defineEmits<{ (e: 'inputRef', el: HTMLInputElement | null): void }>()

const store = useChatStore()
const inputEl = ref<HTMLInputElement | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)
const localValue = ref(store.pendingInput)
const previewUrl = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

watch(() => store.pendingInput, (val) => {
  localValue.value = val
})

const hasContent = computed(() => localValue.value.trim().length > 0 || previewUrl.value !== null)
const isLoading = computed(() => store.isThinking)
const isDisabled = computed(() => !hasContent.value || isLoading.value)

function clearPreview(): void {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  errorMsg.value = null
  if (fileInputEl.value) fileInputEl.value.value = ''
}

function onFileChange(e: Event): void {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  errorMsg.value = null
  if (file.size > MAX_FILE_SIZE) {
    errorMsg.value = '圖片太大，請選擇 5MB 以內的圖片'
    if (fileInputEl.value) fileInputEl.value.value = ''
    return
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function handleSubmit(): void {
  if (isDisabled.value) return
  const imageUrl = previewUrl.value ?? undefined
  store.sendMessage(localValue.value, imageUrl)
  localValue.value = ''
  // 不在此 revoke — URL 已傳入 turn.user.imageUrl，bubble 仍需要它
  previewUrl.value = null
  if (fileInputEl.value) fileInputEl.value.value = ''
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

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

defineExpose({ inputEl })
</script>

<template>
  <div class="chat-input">
    <!-- Hidden file input -->
    <input
      ref="fileInputEl"
      type="file"
      accept="image/*"
      class="chat-input__file-input"
      aria-hidden="true"
      tabindex="-1"
      @change="onFileChange"
    />

    <!-- Image preview row -->
    <div v-if="previewUrl || errorMsg" class="chat-input__preview-row">
      <div v-if="previewUrl" class="chat-input__preview">
        <img :src="previewUrl" class="chat-input__preview-img" alt="preview" />
        <button
          class="chat-input__preview-clear"
          type="button"
          aria-label="Remove image"
          @click="clearPreview"
        >✕</button>
      </div>
      <span v-if="errorMsg" class="chat-input__error">{{ errorMsg }}</span>
    </div>

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
        aria-label="Attach image"
        @click="fileInputEl?.click()"
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
  min-height: 68px;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 25px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  flex-shrink: 0;

  &__file-input {
    display: none;
  }

  &__preview-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 4px;
  }

  &__preview {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  &__preview-img {
    max-height: 48px;
    border-radius: 6px;
    display: block;
  }

  &__preview-clear {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: none;
    background: $gray-600;
    color: #fff;
    font-size: var(--font-size-xss);
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    padding: 0;

    &:hover {
      background: $gray-700;
    }
  }

  &__error {
    font: 400 13px/1.4 'Inter', sans-serif;
    color: $red-500;
  }

  &__field {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font: 400 var(--font-size-md)/24px 'Source Sans 3', 'Source Sans Pro', sans-serif;
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
    font-size: var(--font-size-xl);
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
    font-size: var(--font-size-sm);
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
