/**
 * Markdown renderer matching design.html's formatAiResponse / formatForStreaming output.
 * Bold → <span class="num">, links → <a class="link" data-tooltip>
 */

type Token =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'link'; text: string; url: string }

function parseTokens(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < source.length) {
    // Try bold: **bold**
    if (source[i] === '*' && source[i + 1] === '*') {
      const closeIdx = source.indexOf('**', i + 2)
      if (closeIdx !== -1) {
        tokens.push({ type: 'bold', value: source.slice(i + 2, closeIdx) })
        i = closeIdx + 2
        continue
      }
    }

    // Try link: [text](url)
    if (source[i] === '[') {
      const closeBracket = source.indexOf(']', i + 1)
      if (closeBracket !== -1) {
        const hasParenOpen = source[closeBracket + 1] === '('
        const closeParen = hasParenOpen ? source.indexOf(')', closeBracket + 2) : -1

        if (hasParenOpen && closeParen !== -1) {
          // Complete link
          tokens.push({
            type: 'link',
            text: source.slice(i + 1, closeBracket),
            url: source.slice(closeBracket + 2, closeParen),
          })
          i = closeParen + 1
          continue
        } else {
          // [text] without (url): show text, hide brackets
          tokens.push({ type: 'text', value: source.slice(i + 1, closeBracket) })
          i = closeBracket + 1
          continue
        }
      } else {
        // [ with no closing ]: skip '[', let next iteration handle the rest
        i += 1
        continue
      }
    }

    // Plain text: advance to next potential special char
    let textEnd = i + 1
    while (textEnd < source.length) {
      if (source[textEnd] === '*' && source[textEnd + 1] === '*') break
      if (source[textEnd] === '[') break
      textEnd++
    }
    tokens.push({ type: 'text', value: source.slice(i, textEnd) })
    i = textEnd
  }

  return tokens
}

function tokensToHtml(tokens: Token[]): string {
  return tokens
    .map((tok) => {
      if (tok.type === 'text') return escapeHtml(tok.value)
      if (tok.type === 'bold') return `<span class="num">${escapeHtml(tok.value)}</span>`
      if (tok.type === 'link') {
        const eu = escapeHtml(tok.url)
        return `<a class="link" href="${eu}" data-tooltip="${eu}" target="_blank" rel="noopener">${escapeHtml(tok.text)}</a>`
      }
      return ''
    })
    .join('')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Strip syntax chars from an incomplete token tail before rendering as text.
 */
function stripIncompleteTail(tail: string): string {
  if (!tail) return tail
  // [text] with or without a partial (url) following → show inner text only
  const bracketText = /^\[([^\]]*)\]/.exec(tail)
  if (bracketText) return bracketText[1]!
  // [ with no closing ] → skip [
  if (tail[0] === '[') return tail.slice(1)
  // ** without closing ** → skip **
  if (tail.startsWith('**')) return tail.slice(2)
  // single * → skip
  if (tail[0] === '*') return tail.slice(1)
  return tail
}

/**
 * Given a visible prefix of the full content string, return safe HTML.
 * Incomplete tokens at the tail are stripped of syntax chars.
 */
export function renderPartial(visible: string): string {
  const safeEnd = findSafeEnd(visible)
  const safe = visible.slice(0, safeEnd)
  const tail = visible.slice(safeEnd)

  return tokensToHtml(parseTokens(safe)) + escapeHtml(stripIncompleteTail(tail))
}

/**
 * Find the rightmost safe position (no dangling incomplete token).
 */
function findSafeEnd(s: string): number {
  let end = s.length

  const unmatchedBold = findUnmatchedBoldOpen(s)
  if (unmatchedBold !== -1) end = Math.min(end, unmatchedBold)

  const unmatchedLink = findUnmatchedLinkOpen(s)
  if (unmatchedLink !== -1) end = Math.min(end, unmatchedLink)

  return end
}

function findUnmatchedBoldOpen(s: string): number {
  let pos = 0
  let lastOpen = -1
  while (pos < s.length) {
    if (s[pos] === '*' && s[pos + 1] === '*') {
      lastOpen = lastOpen === -1 ? pos : -1
      pos += 2
    } else {
      pos++
    }
  }
  return lastOpen
}

function findUnmatchedLinkOpen(s: string): number {
  const openIdx = s.lastIndexOf('[')
  if (openIdx === -1) return -1

  const closeIdx = s.indexOf(']', openIdx + 1)
  if (closeIdx === -1) return openIdx
  if (s[closeIdx + 1] !== '(') return openIdx
  const parenClose = s.indexOf(')', closeIdx + 2)
  if (parenClose === -1) return openIdx

  return -1
}

export function renderFull(content: string): string {
  return tokensToHtml(parseTokens(content))
}
