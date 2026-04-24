<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  text: string
  anchorEl: HTMLElement | null
  visible: boolean
}>()

const tooltipEl = ref<HTMLElement | null>(null)
const style = ref({ top: '-9999px', left: '-9999px', opacity: '0' })

watch(() => props.visible, async (visible) => {
  if (!visible || !props.anchorEl) {
    style.value = { ...style.value, opacity: '0' }
    return
  }
  // Position off-screen first so we can measure, then snap to place
  style.value = { top: '-9999px', left: '-9999px', opacity: '0' }
  await nextTick()
  const el = tooltipEl.value
  if (!el) return
  const r = props.anchorEl.getBoundingClientRect()
  const tw = el.offsetWidth
  const th = el.offsetHeight
  let left = r.left
  let top = r.top - th - 6
  if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8
  if (left < 8) left = 8
  if (top < 8) top = r.bottom + 6
  style.value = { top: `${top}px`, left: `${left}px`, opacity: '1' }
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="tooltipEl"
      class="link-tooltip"
      :style="style"
      aria-hidden="true"
    >{{ text }}</div>
  </Teleport>
</template>

<style>
.link-tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(13, 8, 44, 0.88);
  color: #fff;
  padding: 5px 9px;
  border-radius: 5px;
  font: 400 11px/1.5 'Inter', sans-serif;
  max-width: min(700px, calc(100vw - 16px));
  white-space: normal;
  word-break: break-all;
  pointer-events: none;
  transition: opacity 0.12s;
}
</style>
