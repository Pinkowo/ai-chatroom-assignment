import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from 'src/stores/chat'

vi.mock('src/services/matcher', () => ({
  match: vi.fn().mockResolvedValue({
    content: 'Mock response content',
    score: 0.1,
    isFound: true,
    suggestedQuestion: null,
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

async function sendAndFlush(store: ReturnType<typeof useChatStore>, text: string): Promise<void> {
  const promise = store.sendMessage(text)
  await vi.runAllTimersAsync()
  await promise
}

describe('useChatStore', () => {
  describe('sendMessage', () => {
    it('adds a turn after sending', async () => {
      const store = useChatStore()
      await sendAndFlush(store, 'test question')
      expect(store.turns).toHaveLength(1)
    })

    it('stores the user message correctly', async () => {
      const store = useChatStore()
      await sendAndFlush(store, 'test question')
      expect(store.turns[0]!.user.content).toBe('test question')
      expect(store.turns[0]!.user.role).toBe('user')
    })

    it('stores the assistant message from matcher', async () => {
      const store = useChatStore()
      await sendAndFlush(store, 'test question')
      expect(store.turns[0]!.assistant.content).toBe('Mock response content')
      expect(store.turns[0]!.assistant.role).toBe('assistant')
    })

    it('clears pendingInput after sending', async () => {
      const store = useChatStore()
      store.pendingInput = 'prefilled'
      await sendAndFlush(store, 'test question')
      expect(store.pendingInput).toBe('')
    })

    it('trims whitespace from input', async () => {
      const store = useChatStore()
      await sendAndFlush(store, '  hello  ')
      expect(store.turns[0]!.user.content).toBe('hello')
    })

    it('ignores whitespace-only input', async () => {
      const store = useChatStore()
      await sendAndFlush(store, '   ')
      expect(store.turns).toHaveLength(0)
    })

    it('ignores duplicate send while thinking', async () => {
      const store = useChatStore()
      store.isThinking = true
      await sendAndFlush(store, 'question')
      expect(store.turns).toHaveLength(0)
    })
  })

  describe('fillComposer', () => {
    it('sets pendingInput', () => {
      const store = useChatStore()
      store.fillComposer('What is the cheapest glove?')
      expect(store.pendingInput).toBe('What is the cheapest glove?')
    })

    it('overwrites existing pendingInput', () => {
      const store = useChatStore()
      store.fillComposer('first')
      store.fillComposer('second')
      expect(store.pendingInput).toBe('second')
    })
  })

  describe('clearHistory', () => {
    it('resets turns', async () => {
      const store = useChatStore()
      await sendAndFlush(store, 'question 1')
      store.clearHistory()
      expect(store.turns).toHaveLength(0)
    })

    it('resets isThinking and pendingInput', () => {
      const store = useChatStore()
      store.isThinking = true
      store.pendingInput = 'something'
      store.clearHistory()
      expect(store.isThinking).toBe(false)
      expect(store.pendingInput).toBe('')
    })
  })

  describe('persistence', () => {
    it('markThinkingDone sets isThinking to false', () => {
      const store = useChatStore()
      store.isThinking = true
      store.markThinkingDone()
      expect(store.isThinking).toBe(false)
    })
  })
})
