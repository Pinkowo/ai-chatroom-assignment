import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HintCarousel from 'src/components/HintCarousel.vue'

describe('HintCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is visible when hasMessages is false', () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: false },
    })
    expect(wrapper.find('.hint-carousel').isVisible()).toBe(true)
  })

  it('is hidden when hasMessages is true', async () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: true },
    })
    expect(wrapper.find('.hint-carousel').isVisible()).toBe(false)
  })

  it('renders 5 hint items', () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: false },
    })
    expect(wrapper.findAll('.hint-item')).toHaveLength(5)
  })

  it('first hint is active on mount', () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: false },
    })
    const active = wrapper.findAll('.hint-item--active')
    expect(active).toHaveLength(1)
  })

  it('emits select with hint text when text is clicked', async () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: false },
    })
    const activeText = wrapper.find('.hint-item--active .hint-item__text')
    await activeText.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]![0]).toBe('Upload your supplier list')
  })

  it('advances to next hint after 3600ms (motion-on)', async () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: false },
    })
    expect(wrapper.findAll('.hint-item--active')[0]?.text()).toContain('Upload your supplier list')

    vi.advanceTimersByTime(3600)
    // wait for the 450ms exit transition + state update
    vi.advanceTimersByTime(450)
    await wrapper.vm.$nextTick()

    const active = wrapper.find('.hint-item--active')
    expect(active.text()).toContain('Check if Avastin is in stock')
  })

  it('all 5 hint texts are present in the DOM', () => {
    const wrapper = mount(HintCarousel, {
      props: { hasMessages: false },
    })
    const texts = wrapper.findAll('.hint-item__text').map((w) => w.text())
    expect(texts).toContain('Upload your supplier list')
    expect(texts).toContain('Check if Avastin is in stock')
    expect(texts).toContain("Check if there's a better price for Xeomin")
    expect(texts).toContain('What are some generic options for Restylane')
    expect(texts).toContain("What's the best product for Xeomin")
  })
})
