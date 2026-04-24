import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ChatComposer from 'src/components/ChatComposer.vue'

vi.mock('src/stores/chat', () => ({
  useChatStore: vi.fn(() => ({
    pendingInput: '',
    isThinking: false,
    sendMessage: vi.fn(),
  })),
}))

function makeFile(name: string, sizeBytes: number, type = 'image/png'): File {
  const buf = new ArrayBuffer(sizeBytes)
  return new File([buf], name, { type })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('ChatComposer image attachment', () => {
  it('sets previewUrl after selecting a valid image', async () => {
    const createObjectURL = vi.fn(() => 'blob:preview-url')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })

    const wrapper = mount(ChatComposer)
    const fileInput = wrapper.find('input[type="file"]')
    const file = makeFile('photo.png', 1024)

    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true })
    await fileInput.trigger('change')

    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(wrapper.find('.chat-input__preview-img').exists()).toBe(true)
  })

  it('shows error and no preview when file exceeds 5MB', async () => {
    const createObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })

    const wrapper = mount(ChatComposer)
    const fileInput = wrapper.find('input[type="file"]')
    const bigFile = makeFile('big.png', 6 * 1024 * 1024)

    Object.defineProperty(fileInput.element, 'files', { value: [bigFile], configurable: true })
    await fileInput.trigger('change')

    expect(createObjectURL).not.toHaveBeenCalled()
    expect(wrapper.find('.chat-input__error').text()).toContain('5MB')
  })

  it('clears preview on ✕ click and calls revokeObjectURL', async () => {
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL })

    const wrapper = mount(ChatComposer)
    const fileInput = wrapper.find('input[type="file"]')
    const file = makeFile('photo.png', 512)

    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true })
    await fileInput.trigger('change')

    await wrapper.find('.chat-input__preview-clear').trigger('click')

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x')
    expect(wrapper.find('.chat-input__preview-img').exists()).toBe(false)
  })
})
