import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownRenderer from 'src/components/MarkdownRenderer'

function mountRenderer(content: string, partial = false) {
  return mount(MarkdownRenderer, {
    props: { content, partial },
  })
}

describe('MarkdownRenderer — bold rendering', () => {
  it('renders **bold** as element with class "num"', () => {
    const wrapper = mountRenderer('Hello **world**')
    const numEl = wrapper.find('.num')
    expect(numEl.exists()).toBe(true)
    expect(numEl.text()).toContain('world')
  })
})

describe('MarkdownRenderer — link rendering', () => {
  it('renders valid https link as <a> with correct attributes', () => {
    const wrapper = mountRenderer('[click here](https://example.com)')
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.classes()).toContain('link')
    expect(a.attributes('href')).toBe('https://example.com')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
    expect(a.attributes('data-tooltip')).toBe('https://example.com')
    expect(a.text()).toBe('click here')
  })

  it('renders valid http link as <a>', () => {
    const wrapper = mountRenderer('[site](http://example.com)')
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('degrades javascript: URL to plain text — no <a> element', () => {
    const wrapper = mountRenderer('[x](javascript:alert(1))')
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('x')
  })

  it('degrades data: URL to plain text — no <a> element', () => {
    const wrapper = mountRenderer('[x](data:text/html,foo)')
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('x')
  })

  it('sets target="_blank" on external links', () => {
    const wrapper = mountRenderer('[visit](https://example.com)')
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })
})

describe('MarkdownRenderer — partial rendering (no raw syntax exposed)', () => {
  it('partial bold "**bo" does not expose raw ** in output', () => {
    const wrapper = mountRenderer('**bo', true)
    expect(wrapper.html()).not.toContain('**')
  })

  it('partial link "[text" shows link text immediately, no raw [ exposed', () => {
    const wrapper = mountRenderer('[text', true)
    expect(wrapper.html()).not.toContain('[')
    expect(wrapper.text()).toContain('text')
  })

  it('partial link "[text](https://ex" shows link text immediately, no raw [ exposed', () => {
    const wrapper = mountRenderer('[text](https://ex', true)
    expect(wrapper.html()).not.toContain('[')
    expect(wrapper.text()).toContain('text')
  })

  it('fully formed bold renders .num element', () => {
    const wrapper = mountRenderer('**bold**', false)
    expect(wrapper.find('.num').exists()).toBe(true)
    expect(wrapper.find('.num').text()).toContain('bold')
  })

  it('link text upgrades to <a> once full [text](url) is received', async () => {
    const wrapper = mountRenderer('[Product Link', true)
    // Text visible immediately, no link yet
    expect(wrapper.text()).toContain('Product Link')
    expect(wrapper.find('a').exists()).toBe(false)

    // URL arrives — link resolves
    await wrapper.setProps({ content: '[Product Link](https://example.com)' })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').text()).toBe('Product Link')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })

  it('link resolves correctly when ] and (url) arrive in separate chunks', async () => {
    const wrapper = mountRenderer('[Product Link', true)
    await wrapper.setProps({ content: '[Product Link]' })  // ] arrives, no ( yet — must wait
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('Product Link')
    await wrapper.setProps({ content: '[Product Link](https://example.com)' })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })

  it('unsafe URL during streaming degrades to plain text span', async () => {
    const wrapper = mountRenderer('[bad link', true)
    await wrapper.setProps({ content: '[bad link](javascript:alert(1))' })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('bad link')
  })

  it('list item link — pending text appears inside list item, not previous item', async () => {
    // Simulates "   - Vendor: Medline\n   - [Product Link](url)" arriving in chunks
    const wrapper = mountRenderer('- Item A\n- [Product Link', true)
    const html = wrapper.html()
    // Link text should be inside a <li>, not leaked outside the list
    expect(html).not.toContain('[')
    expect(wrapper.text()).toContain('Product Link')
    // Resolve the link
    await wrapper.setProps({ content: '- Item A\n- [Product Link](https://example.com)' })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').text()).toBe('Product Link')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })

  it('list item link — no stray ZWSP in final output', async () => {
    const wrapper = mountRenderer('- [Link', true)
    await wrapper.setProps({ content: '- [Link](https://example.com)', partial: false })
    // No zero-width space should appear in the DOM
    expect(wrapper.html()).not.toContain('​')
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').text()).toBe('Link')
  })
})
