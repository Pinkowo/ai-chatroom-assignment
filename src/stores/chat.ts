import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ConversationTurn, Message } from 'src/types/chat'
import { match } from 'src/services/matcher'

function newId(): string {
  return crypto.randomUUID()
}

export const useChatStore = defineStore(
  'chat',
  () => {
    const turns = ref<ConversationTurn[]>([])
    const isThinking = ref(false)
    const pendingInput = ref('')

    async function sendMessage(text: string): Promise<void> {
      const trimmed = text.trim()
      if (!trimmed || isThinking.value) return

      const userMsg: Message = {
        id: newId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      isThinking.value = true
      pendingInput.value = ''

      // Push a placeholder turn immediately so the thinking indicator renders
      const turnIdx = turns.value.length
      turns.value.push({
        user: userMsg,
        assistant: { id: newId(), role: 'assistant', content: '', timestamp: '' },
        suggestedQuestion: null,
      })

      // Match design.html: minimum 1500ms thinking delay so the indicator is visible
      const [result] = await Promise.all([
        match(trimmed),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ])

      // Update the turn in-place with the real response
      turns.value[turnIdx] = {
        user: userMsg,
        assistant: {
          id: turns.value[turnIdx]!.assistant.id,
          role: 'assistant',
          content: result.content,
          timestamp: new Date().toISOString(),
        },
        suggestedQuestion: result.suggestedQuestion,
      }
      // isThinking stays true until TypewriterText emits 'done' → markThinkingDone()
    }

    function fillComposer(text: string): void {
      pendingInput.value = text
    }

    function clearHistory(): void {
      turns.value = []
      pendingInput.value = ''
      isThinking.value = false
    }

    function markThinkingDone(): void {
      isThinking.value = false
    }

    return { turns, isThinking, pendingInput, sendMessage, fillComposer, clearHistory, markThinkingDone }
  }
)
