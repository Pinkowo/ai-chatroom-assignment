<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import MarkdownRenderer from 'src/components/MarkdownRenderer'

const props = defineProps<{ content: string; streaming?: boolean }>()
const emit = defineEmits<{ (e: 'done'): void }>()

const CHARS_PER_TICK = 1
const TICK_MS = 22

const visibleContent = ref('')
let timerId: ReturnType<typeof setTimeout> | null = null
let position = 0

function tick(): void {
  position = Math.min(position + CHARS_PER_TICK, props.content.length)

  // Skip trailing newlines without pausing (match design.html behaviour)
  const nlMatch = props.content.slice(position).match(/^\n+/)
  if (nlMatch) {
    position = Math.min(position + nlMatch[0].length, props.content.length)
  }

  // Skip invisible URL text inside [label](url) — jump to closing )
  // so the URL is never typed character-by-character
  const visible = props.content.slice(0, position)
  if (/\[[^\]]+\]\([^)]*$/.test(visible)) {
    const closeIdx = props.content.indexOf(')', position)
    if (closeIdx !== -1) {
      position = Math.min(closeIdx + 1, props.content.length)
    }
  }

  if (position < props.content.length) {
    visibleContent.value = props.content.slice(0, position)
    timerId = setTimeout(tick, TICK_MS)
  } else {
    visibleContent.value = props.content
    timerId = null
    emit('done')
  }
}

function startAnimation(): void {
  if (timerId !== null) clearTimeout(timerId)
  timerId = null
  position = 0
  visibleContent.value = ''
  timerId = setTimeout(tick, TICK_MS)
}

watch(
  () => props.content,
  (val) => { if (val && !props.streaming) startAnimation() },
  { immediate: true }
)

onUnmounted(() => {
  if (timerId !== null) clearTimeout(timerId)
})
</script>

<template>
  <MarkdownRenderer v-if="streaming" :content="content" :partial="true" />
  <template v-else>
    <MarkdownRenderer :content="visibleContent" :partial="true" />
  </template>
</template>
