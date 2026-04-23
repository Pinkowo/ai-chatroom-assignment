import { describe, it, expect } from 'vitest'
import { renderPartial, renderFull } from 'src/services/markdown-parser'

const BOLD_LINK_CONTENT = 'Hello **world** and [click here](https://example.com) done'

function allFrames(content: string): string[] {
  return Array.from({ length: content.length }, (_, i) => renderPartial(content.slice(0, i + 1)))
}

describe('renderPartial — no raw syntax at any frame', () => {
  it('never exposes ** in any frame', () => {
    const frames = allFrames(BOLD_LINK_CONTENT)
    for (const html of frames) {
      expect(html, `frame: ${html}`).not.toMatch(/\*\*/)
    }
  })

  it('never exposes [ or ] in any frame', () => {
    const frames = allFrames(BOLD_LINK_CONTENT)
    for (const html of frames) {
      const rawBrackets = html.replace(/&lt;/g, '').replace(/&gt;/g, '')
      expect(rawBrackets, `frame: ${html}`).not.toMatch(/\[/)
      expect(rawBrackets, `frame: ${html}`).not.toMatch(/\]/)
    }
  })

  it('fully rendered frame contains <span class="num">', () => {
    const result = renderFull('Hello **world**')
    expect(result).toContain('<span class="num">world</span>')
  })
})

describe('renderFull — link rendering', () => {
  it('renders [text](url) as <a class="link"> with data-tooltip', () => {
    const result = renderFull('[click here](https://example.com)')
    expect(result).toContain('<a class="link"')
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('data-tooltip="https://example.com"')
    expect(result).toContain('click here')
  })

  it('sets target="_blank" on links', () => {
    const result = renderFull('[visit](https://example.com)')
    expect(result).toContain('target="_blank"')
  })
})

describe('renderFull — malformed markdown', () => {
  it('unclosed ** displays literal text without breaking layout', () => {
    const result = renderFull('hello **unclosed')
    expect(result).not.toContain('<span class="num">')
    expect(result).toContain('hello')
    expect(result).toContain('unclosed')
  })

  it('unclosed [ displays without brackets', () => {
    const result = renderFull('text [broken')
    expect(result).not.toContain('[')
    expect(result).toContain('text')
    expect(result).toContain('broken')
  })

  it('standalone ] does not crash', () => {
    expect(() => renderFull('text ] more')).not.toThrow()
  })
})

describe('renderPartial — partial bold and link', () => {
  it('partial bold token does not show **', () => {
    const partial = renderPartial('Hello **wor')
    expect(partial).not.toContain('**')
  })

  it('partial link token does not show [', () => {
    const partial = renderPartial('[cli')
    expect(partial).not.toContain('[')
  })
})
