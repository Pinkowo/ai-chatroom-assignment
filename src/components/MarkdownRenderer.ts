import { defineComponent, h, ref, watch, onMounted, onUnmounted } from 'vue'
import * as smd from 'streaming-markdown'

const SAFE_URL_RE = /^https?:\/\//i

// Zero-width space used to force streaming-markdown to materialize the current
// block element (e.g. a new <li>) before we know the first real content char.
// Never appears in real markdown; suppressed before it reaches the DOM.
const ZWSP = '​'

// Matches lines that are exactly a list item prefix: optional indent + marker + space(s).
// Used to detect when writtenLength has just advanced past "   - " so we know
// the next parser_write will create a new list item.
const LIST_BOUNDARY_RE = /^\s*(?:[-*+]|\d+\.)\s+$/

/**
 * Returns [renderer, getLeafNode, enableZwspSuppression].
 *
 * getLeafNode() queries renderer.data — streaming-markdown's SHARED MUTABLE object —
 * to get the exact element the parser is currently writing to.
 *   index > 0  → inside a block (<p>, <li>, etc.): return that element
 *   index == 0 → at root level (block just closed): return null
 *
 * enableZwspSuppression() arms a one-shot filter: the next add_text call whose
 * text is exactly ZWSP will be silently dropped instead of reaching the DOM.
 * This lets us write ZWSP as a "trigger character" to force block creation
 * without leaving a stray character in the output.
 */
function createSafeRenderer(element: HTMLElement): [smd.Default_Renderer, () => HTMLElement | null, () => void] {
  const renderer = smd.default_renderer(element)
  const origAddToken = renderer.add_token
  const origSetAttr = renderer.set_attr
  const origAddText = renderer.add_text
  const data = renderer.data  // shared mutable object; data.index is always live

  let suppressNextZwsp = false

  renderer.add_token = (d, type) => {
    origAddToken(d, type)
    const el = d.nodes[d.index]
    if (el && (type === smd.STRONG_AST || type === smd.STRONG_UND)) {
      el.classList.add('num')
    }
  }

  renderer.set_attr = (d, type, value) => {
    if (type === smd.HREF) {
      const el = d.nodes[d.index]
      if (SAFE_URL_RE.test(value)) {
        origSetAttr(d, type, value)
        if (el) {
          el.classList.add('link')
          el.setAttribute('rel', 'noopener noreferrer')
          el.setAttribute('target', '_blank')
          el.setAttribute('data-tooltip', value)
        }
      } else if (el) {
        // Unsafe URL: swap <a> for <span>, preserving already-appended text
        const span = document.createElement('span')
        while (el.firstChild) span.appendChild(el.firstChild)
        el.parentNode?.replaceChild(span, el)
        d.nodes[d.index] = span
      }
    } else {
      origSetAttr(d, type, value)
    }
  }

  renderer.add_text = (d, text) => {
    if (suppressNextZwsp && text === ZWSP) {
      suppressNextZwsp = false
      return
    }
    origAddText(d, text)
  }

  return [
    renderer,
    () => data.index > 0 ? data.nodes[data.index] as HTMLElement : null,
    () => { suppressNextZwsp = true },
  ]
}

/**
 * Returns the index of the first incomplete regular link [text... in `text`.
 * Skips image links ![ and complete links [text](url).
 * Returns -1 if no incomplete link is found.
 */
function findPartialLinkStart(text: string): number {
  let i = 0
  while (i < text.length) {
    const idx = text.indexOf('[', i)
    if (idx === -1) return -1

    // Skip image links ![
    if (idx > 0 && text[idx - 1] === '!') {
      i = idx + 1
      continue
    }

    // Check if this is a complete [text](url)
    const after = text.slice(idx + 1)
    const closeBracket = after.indexOf(']')
    if (closeBracket !== -1 && after[closeBracket + 1] === '(') {
      const closeParen = after.indexOf(')', closeBracket + 2)
      if (closeParen !== -1) {
        // Complete link — skip past it
        i = idx + 1 + closeParen + 1
        continue
      }
    }

    return idx
  }
  return -1
}

/**
 * Hold back from an incomplete image link ![...](url) to prevent partial rendering.
 */
function safeImageCutoff(text: string): number {
  const imgIdx = text.lastIndexOf('![')
  if (imgIdx === -1) return text.length
  const closeText = text.indexOf(']', imgIdx + 2)
  if (closeText === -1) return imgIdx
  if (text[closeText + 1] !== '(') return text.length
  if (text.indexOf(')', closeText + 2) === -1) return imgIdx
  return text.length
}

export default defineComponent({
  name: 'MarkdownRenderer',
  props: {
    content: { type: String, required: true },
    partial: { type: Boolean, default: false },
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null)
    let parser: ReturnType<typeof smd.parser> | null = null
    let getLeafNode: (() => HTMLElement | null) | null = null
    let enableZwspSuppression: (() => void) | null = null
    let writtenLength = 0
    let ended = false

    // Progressive link: span showing link text before URL arrives
    let pendingLinkEl: HTMLElement | null = null
    let pendingLinkStart = 0       // absolute index of [ in props.content
    let pendingWrapperEl: HTMLElement | null = null  // temp <p> when link starts a new block

    function removePending(): void {
      pendingLinkEl?.remove()
      pendingLinkEl = null
      pendingWrapperEl?.remove()
      pendingWrapperEl = null
    }

    function resolveOrUpdatePendingLink(newContent: string): void {
      if (!pendingLinkEl || !parser || ended) return

      const fromBracket = newContent.slice(pendingLinkStart)  // starts with [
      const closeBracket = fromBracket.indexOf(']')

      if (closeBracket === -1) {
        // Still streaming text inside [...]
        pendingLinkEl.textContent = fromBracket.slice(1)
        writtenLength = newContent.length
        return
      }

      if (fromBracket[closeBracket + 1] === undefined) {
        // ] is at end of current content — wait; ( may arrive in next chunk
        pendingLinkEl.textContent = fromBracket.slice(1, closeBracket)
        writtenLength = newContent.length
        return
      }

      if (fromBracket[closeBracket + 1] !== '(') {
        // ] followed by non-( character — plain bracket, not a link; commit as-is
        const savedStart = pendingLinkStart
        removePending()
        smd.parser_write(parser, fromBracket.slice(0, closeBracket + 1))
        writtenLength = savedStart + closeBracket + 1
        writeChunk(newContent)
        return
      }

      const urlContent = fromBracket.slice(closeBracket + 2)  // content after (
      const closeParen = urlContent.indexOf(')')
      if (closeParen === -1) {
        // Have [text]( but URL not closed yet — show only link text
        pendingLinkEl.textContent = fromBracket.slice(1, closeBracket)
        writtenLength = newContent.length
        return
      }

      // Full [text](url) received — remove span + wrapper, feed to streaming-markdown
      const savedStart = pendingLinkStart
      const linkStr = fromBracket.slice(0, closeBracket + 2 + closeParen + 1)
      removePending()
      smd.parser_write(parser, linkStr)
      writtenLength = savedStart + linkStr.length
      writeChunk(newContent)
    }

    function writeChunk(newContent: string): void {
      if (!parser || ended || pendingLinkEl) return

      const pending = newContent.slice(writtenLength)
      if (!pending) return

      const partialIdx = findPartialLinkStart(pending)

      if (partialIdx === -1) {
        // No partial regular link — hold back incomplete image links only
        const cutoff = safeImageCutoff(pending)
        const chunk = pending.slice(0, cutoff)
        if (chunk) {
          smd.parser_write(parser, chunk)
          writtenLength += chunk.length
        }
        return
      }

      // Write everything before the partial [
      if (partialIdx > 0) {
        const before = pending.slice(0, partialIdx)
        const cutoff = safeImageCutoff(before)
        const chunk = before.slice(0, cutoff)
        if (chunk) {
          smd.parser_write(parser, chunk)
          writtenLength += chunk.length
        }
        if (cutoff < before.length) return  // held back by image link
      }

      // Place pending span at the correct DOM position.
      //
      // If the current line (from last \n to writtenLength) is exactly a list item
      // prefix like "   - ", streaming-markdown won't have called add_list_item yet
      // (it fires on the FIRST content character). We write ZWSP as a trigger so
      // the new <li> is materialized before we query the leaf node.
      const lineStart = newContent.lastIndexOf('\n', writtenLength - 1) + 1
      const linePrefix = newContent.slice(lineStart, writtenLength)
      if (LIST_BOUNDARY_RE.test(linePrefix)) {
        enableZwspSuppression?.()
        smd.parser_write(parser, ZWSP)
      }

      // getLeafNode() queries renderer.data.index live:
      //   > 0 → parser is inside a block (e.g. <li>, <p>) — append inline
      //   = 0 → parser is at root level (block just closed) — need a new block wrapper
      const afterBracket = pending.slice(partialIdx + 1)
      const closeBracketInAfter = afterBracket.indexOf(']')
      const linkText = closeBracketInAfter !== -1 ? afterBracket.slice(0, closeBracketInAfter) : afterBracket

      const container = containerRef.value
      if (!container) return

      const leaf = getLeafNode?.()
      let parent: HTMLElement
      if (leaf) {
        // Inside an open block — append inline (handles <li>, mid-paragraph, etc.)
        parent = leaf
      } else {
        // At root level — create a temporary <p> so text appears on its own line
        const wrapper = document.createElement('p')
        container.appendChild(wrapper)
        pendingWrapperEl = wrapper
        parent = wrapper
      }

      pendingLinkEl = document.createElement('span')
      pendingLinkEl.textContent = linkText
      parent.appendChild(pendingLinkEl)
      pendingLinkStart = writtenLength  // writtenLength now points exactly at [
      writtenLength = newContent.length
    }

    function flush(): void {
      if (!parser || ended) return
      if (pendingLinkEl) {
        const savedStart = pendingLinkStart
        removePending()
        const fromBracket = props.content.slice(savedStart)
        if (fromBracket) {
          smd.parser_write(parser, fromBracket)
          writtenLength = props.content.length
        }
        return
      }
      const remaining = props.content.slice(writtenLength)
      if (remaining) {
        smd.parser_write(parser, remaining)
        writtenLength = props.content.length
      }
    }

    function endParser(): void {
      if (parser && !ended) {
        flush()
        smd.parser_end(parser)
        ended = true
      }
    }

    onMounted(() => {
      if (!containerRef.value) return
      const [renderer, _getLeafNode, _enableZwspSuppression] = createSafeRenderer(containerRef.value)
      parser = smd.parser(renderer)
      getLeafNode = _getLeafNode
      enableZwspSuppression = _enableZwspSuppression
      writtenLength = 0
      ended = false
      pendingLinkEl = null
      pendingLinkStart = 0
      pendingWrapperEl = null

      if (props.content) writeChunk(props.content)
      if (!props.partial) endParser()
    })

    watch(() => props.content, (newContent) => {
      if (!parser || ended) return
      if (pendingLinkEl) {
        resolveOrUpdatePendingLink(newContent)
      } else {
        writeChunk(newContent)
      }
    })

    watch(() => props.partial, (partial) => {
      if (!partial) endParser()
    })

    onUnmounted(endParser)

    return () => h('span', { ref: containerRef })
  },
})
