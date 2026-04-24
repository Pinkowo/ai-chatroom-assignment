# Design Spec: build-ai-chatroom-mvp

> Generated from: design/design.html (Extract Mode)
> Platform: html
> Last updated: 2026-04-23

---

## Visual Identity

### Color Palette

| Token | Resolved Value | Usage |
|-------|---------------|-------|
| `$teal-700` (`--brand`) | `#264d4f` | Header bg, send button, streaming caret, avatar |
| `$gray-0` (`--bubble-ai`) | `#f4f5f6` | AI message bubble background |
| `$teal-100` (`--bubble-user`) | `#a9d4d6` | User message bubble background |
| `--text` | `#0d082c` | Primary body text |
| `--text-muted` | `rgba(13,8,44,0.6)` | Input placeholder, muted labels |
| `$gray-100` (`--border`) | `#e3e6e8` | Input area top border, tweaks panel border |
| `$gray-500` (`--btn-disabled`) | `#8f9ca3` | Send button disabled / loading state |
| `$orange-400` (`--accent`) | `#fb7429` | Launcher pill, link text color |
| `$teal-300` (`--hint-icon`) | `#64b1b5` | Hint carousel icon color |
| `--shadow` | `0 30px 60px rgba(38,77,79,0.25)` | Chat window elevation |
| `#f2f3f5` | — | Page background (between $gray-0 and $gray-50) |
| `#fcebea` | — | Error bubble background |
| `#a51b14` | — | Error bubble text/icon color |

### Typography

| Usage | Font | Size | Weight | Line-height |
|-------|------|------|--------|-------------|
| Chat header title (h1) | Source Sans 3 | 30px | 700 | 1 |
| Chat header subtitle | Source Sans 3 | 16px | 400 | 1.5 |
| Message bubbles | Inter | 16px | 400 | 1.4 |
| Hint carousel text | Inter | 14px | 400 | 17px |
| Send button / tweaks | Inter | 12–14px | 500–600 | — |
| Launcher label | Inter | 14px | 600 | 20px |
| Input field | Source Sans 3 | 16px | 400 | 24px |
| Bold spans inside AI reply | Inter | inherit | 700 | — |

### Spacing Scale

| Usage | Value |
|-------|-------|
| Chat window border-radius | 8px |
| Header padding | 18px 20px |
| Body padding | 32px 20px 20px |
| Input area height | 68px, padding 16px 20px |
| Input actions gap | 25px (input↔actions), 20px (attach↔send) |
| Message gap (between rows) | 15px |
| User message right padding | 90px |
| Bubble padding | 10px 16px |
| Thinking dots gap | 5px |
| Hint carousel height | 33px |

### Visual Style

- Chat window: `border-radius: 8px`, `box-shadow: var(--shadow)`, white background, `overflow: hidden`
- Launcher pill: `border-radius: 18px`, `width: 137px`, `height: 36px`
- AI bubble: `border-radius: 0 10px 10px 10px`
- User bubble: `border-radius: 10px 0 10px 10px`
- Send button: `border-radius: 50%`, `36×36px`
- Link text: `$orange-400`, underline, `text-underline-offset: 2px`
- Scrollbar: 6px wide, `#e0e3e5` thumb, `border-radius: 3px`

---

## Components

### Launcher

**Layout:**
- Position: `fixed`, `right: 30px`, `bottom: 30px`, `z-index: 25`
- Inline-flex, `align-items: center`, `gap: 8px`
- Size: `137×36px`, `padding: 0 16px`

**States:**

| State | Visual |
|-------|--------|
| Default | `$orange-400` bg, white text, drop shadow |
| Hover | `translateY(-1px)`, `brightness(1.05)`, stronger orange shadow |
| App open | Button still visible (chat window appears above it) |
| App closed | Launcher is the only visible element |

**Children:**
- FA solid `fa-wand-magic-sparkles` (12px, white)
- Label span: "Ask Nitra AI"

---

### ChatWindow

**Layout:**
- Position: `fixed`, `right: 30px`, `bottom: 78px`, `z-index: 20`
- Default: `width: 780px`, `height: 591px`
- Expanded: `width: min(1100px, 100vw-48px)`, `height: min(860px, 100vh-120px)`
- Flex column: header → body → input

**States:**

| State | Animation |
|-------|-----------|
| Opening | `pop` keyframe: `opacity 0→1`, `scale 0.94→1`, `translateY 10→0`, 0.34s cubic-bezier(0.2,0.9,0.3,1.2), `transform-origin: bottom right` |
| Closing | `popOut` keyframe: reverse, 0.22s ease |
| Closed | `display: none` |

---

### ChatHeader

**Layout:**
- Background: `$teal-700`
- Padding: `18px 20px`
- Flex row, `align-items: flex-start`, `gap: 16px`
- `border-radius: 8px 8px 0 0`

**Children:**
- **Emblem**: Nitra logo SVG (`46×23px`), white fill, `margin-top: 7px`
- **Titles block**: h1 "Nitra AI" (30px/700), wand icon (24px) inline; subtitle (16px/400)
- **Actions**: absolute `top: 14px; right: 14px`
  - Close icon-btn: `28×28px`, transparent bg, hover `rgba(255,255,255,0.12)`, FA `fa-xmark`

---

### ChatBody

**Layout:**
- `flex: 1`, `overflow-y: auto`, `padding: 32px 20px 20px`
- Flex column, `gap: 15px`, `scroll-behavior: smooth`
- Custom scrollbar: 6px, `#e0e3e5`

**Children (in order):** message rows, then HintCarousel at bottom

---

### MessageRow

**Layout — User:**
- `justify-content: flex-end`, `padding: 0 90px 0 0`
- Slide-in animation: `translateY(8px)→0`, opacity 0→1, 0.32s

**Layout — AI:**
- `gap: 10px` (avatar + bubble)
- Avatar: `24×24px`, teal circle with Nitra N mark SVG

**Bubble — AI:**
- Background: `$gray-0` (`#f4f5f6`)
- `border-radius: 0 10px 10px 10px`
- `padding: 10px 16px`, Inter 16px/400/1.4

**Bubble — User:**
- Background: `$teal-100` (`#a9d4d6`)
- `border-radius: 10px 0 10px 10px`
- Same padding/font

---

### ThinkingBubble

**Layout:**
- AI-style bubble with `padding: 14px 18px`
- Inline-flex, `gap: 5px`, `align-items: center`

**Dots:**
- 3 × `7×7px` circles, `background: #73838c` ($gray-600)
- `dot` animation: `translateY 0→-4px→0`, opacity `0.5→1→0.5`, 1.3s ease-in-out infinite
- Delays: +0.15s, +0.3s

---

### StreamingCaret

**Layout:**
- `::after` pseudo on `.streaming` bubble
- Content: `▍`, `$teal-700` color, `font-weight: 300`, `margin-left: 2px`
- `caret` animation: opacity 0.5 at 50%, 1s `steps(2)` infinite

---

### AIResponseContent

**Bold spans:** `<span class="num">`, `font-weight: 700`

**Links:** `<a class="link">`, `$orange-400`, underline, `text-underline-offset: 2px`; hover: no underline; `data-tooltip` attribute for tooltip

**Pre-wrap:** `white-space: pre-wrap` to preserve newlines

---

### LinkTooltip

**Layout:**
- `position: fixed`, `z-index: 9999`
- Body-level element (appended to `<body>` to escape `overflow: hidden`)
- Background: `rgba(13,8,44,0.88)`, white text
- `padding: 5px 9px`, `border-radius: 5px`, Inter 11px/400/1.5
- `max-width: min(700px, 100vw-16px)`, `word-break: break-all`
- `pointer-events: none`

**States:**

| State | Visual |
|-------|--------|
| Hidden | `opacity: 0` |
| Visible | `opacity: 1`, `transition: 0.12s` |

**Positioning logic:** appears above link if room, below if not; clamps to viewport edges

---

### HintCarousel

**Layout:**
- At bottom of ChatBody, `height: 33px`, `position: relative`, `overflow: hidden`
- Hidden when any user message exists
- Single slot element with class transitions

**Hint Item:**
- `position: absolute`, `inset: 0`
- Flex row, `gap: 8px`, `align-items: center`
- Icon: `$teal-300`, 16px, FA icon per hint
- Text: `#5c6970` ($gray-700), 14px/17px; hover → `$teal-700`; click → fills input + focuses

**Animation (motion-on):**

| Phase | Transform | Opacity | Duration |
|-------|-----------|---------|----------|
| Idle (next) | `translateY(22px)` | 0 | — |
| Enter | `translateY(0)` | 1 | 0.45s ease |
| Exit | `translateY(-22px)` | 0 | 0.45s ease |

Advance interval: 3600ms. Snap-reset between exit and enter (no transition on snap).

**5 default hints:**

| Icon | Text |
|------|------|
| `fa-regular fa-rectangle-list` | Upload your supplier list |
| `fa-solid fa-cart-shopping` | Check if Avastin is in stock |
| `fa-solid fa-hand-holding-dollar` | Check if there's a better price for Xeomin |
| `fa-solid fa-magnifying-glass` | What are some generic options for Restylane |
| `fa-solid fa-thumbs-up` | What's the best product for Xeomin |

---

### ChatInputArea

**Layout:**
- `border-top: 1px solid $gray-100`
- `height: 68px`, `padding: 16px 20px`
- Flex row, `align-items: center`, `gap: 25px`

**Input field:**
- `flex: 1`, no border, no outline, transparent bg
- Source Sans 3, 16px/24px, `color: --text`
- Placeholder: `--text-muted`
- Disabled: `cursor: not-allowed`

**Input Actions:**
- Flex row, `gap: 20px`
- Attach button: `20×20px`, FA `fa-paperclip`, `--text-muted` color; hover → `--text`
- Send button (see below)

---

### SendButton

**Layout:**
- `36×36px`, `border-radius: 50%`
- `background: $teal-700`, white icon
- Grid center

**Icon:** FA solid `fa-chevron-right` (default)

**States:**

| State | Background | Icon | Cursor | Disabled |
|-------|-----------|------|--------|---------|
| Enabled | `$teal-700` | `fa-chevron-right` | pointer | false |
| Hover (enabled) | scale(1.06) | — | — | — |
| Disabled-empty | `$gray-500` | `fa-chevron-right` | not-allowed | true |
| Loading-thinking | `$gray-500` | SVG ring animation | not-allowed | true |

**Loading ring:** SVG circle (`cx/cy 12`, `r 9`), `stroke-dashoffset` 56.55→0→-56.55, 1.4s ease-in-out infinite; disabled when `motion-off`

---

### ErrorBubble

**Layout:** AI-style row (avatar + bubble), flex row, `gap: 10px`, `align-items: flex-start`

**Bubble:**
- Background: `#fcebea`
- Color: `#a51b14`
- `border-radius: 0 10px 10px 10px`
- FA `fa-triangle-exclamation` + error text + "Try again" button

**Retry button:** transparent bg, same red color, underline, no padding

---

## Responsive Strategy

### Breakpoints

| Name | Max Width | Changes |
|------|-----------|---------|
| Tablet/Mobile | 840px | Widget fills screen: `right/left: 12px`, `bottom: 70px`; height `100vh - 84px`; user msg padding-right 20px |
| Small Mobile | 480px | Logo 38×19px, h1 22px, body padding 20px 14px, input padding 12px 14px, input gap 10px |

### Widget Position

| Breakpoint | Chat Window | Launcher |
|-----------|------------|---------|
| > 840px | `right: 30px, bottom: 78px`, `780×591px` | `right: 30px, bottom: 30px` |
| ≤ 840px | `right/left: 12px, bottom: 70px`, full width, full height | Same position, button unchanged |
