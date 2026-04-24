# Interaction Spec: build-ai-chatroom-mvp

> Generated from: proposal.md + design-spec.md (HTML Extract)
> DSL Version: draft-1
> Last updated: 2026-04-23

---

## Screens

### Screen: ChatWidget

**States:**

| State | Description | Entry Condition |
|-------|-------------|-----------------|
| Closed | Only launcher pill visible | Initial load / user clicks close |
| Opening | Chat window animating in | Launcher click when closed |
| Open-Empty | Chat open, no user messages, hint carousel visible | After open, no messages |
| Open-Active | Chat open, conversation in progress | After first user message |
| Thinking | AI computing / streaming | After user submits message |
| Expanded | Wider/taller window | User clicks expand (if present) |

**Transitions:**
```
Closed -> Opening : launcher click
Opening -> Open-Empty : pop animation complete (0.34s)
Open-Empty -> Thinking : user submits first message
Open-Active -> Thinking : user submits subsequent message
Thinking -> Open-Active : AI streaming complete → markThinkingDone()
Open-Active -> Closed : close button click (popOut 0.22s)
Open-Empty -> Closed : close button click
```

---

### Screen: HintCarousel

**States:**

| State | Description | Entry Condition |
|-------|-------------|-----------------|
| Visible | Rotating hints shown | No user messages in conversation |
| Hidden | Carousel hidden | Any user message present |
| Transitioning | Exit + enter animation between hints | Every 3600ms (motion-on) |

**Transitions:**
```
Visible -> Transitioning : timer fires (3600ms)
Transitioning -> Visible : enter animation complete (0.45s)
Visible -> Hidden : first user message sent
Hidden -> Visible : chat history cleared [edge case, not in MVP]
```

---

### Screen: InputArea

**States:**

| State | Description | Entry Condition |
|-------|-------------|-----------------|
| Empty | Input blank, send disabled | Initial / after send |
| Has-Input | Input has non-whitespace, send enabled | User types |
| Thinking | Input disabled, send shows ring | After submit |

**Transitions:**
```
Empty -> Has-Input : user types non-whitespace
Has-Input -> Empty : user clears input
Has-Input -> Thinking : user clicks send or presses Enter
Thinking -> Empty : AI stream complete → pendingInput cleared
```

---

## Flows

### Flow: Send Message

**Description:** User types a question, submits, sees thinking dots, then AI streams the response.

```
1. User types in input field
   -> Input value updates
   -> Send button transitions Empty→Has-Input (brand color, enabled)

2. User presses Enter or clicks send button
   -> Guard: input.trim() empty or state.thinking → no-op
   -> User message appended to chat body (slide-in animation)
   -> Input cleared, thinking = true
   -> Thinking bubble appears (AI avatar + 3 bouncing dots)
   -> Send button transitions Has-Input→Thinking (gray-500, ring spinner, disabled)
   -> Input disabled with placeholder "Nitra AI is thinking…"

3. System calls matcher (async, ~0ms for mock)
   -> Thinking bubble removed
   -> AI message bubble added (empty, streaming=true)
   -> Streaming caret (▍) appears at end of bubble

4. TypewriterText streams content
   -> 3 chars / 22ms tick (motion-on)
   -> Each tick: formatForStreaming() renders safe HTML (no raw markdown)
   -> Chat body scrolls to bottom each tick

5. Stream complete
   -> Caret removed
   -> Full formatAiResponse() renders final HTML
   -> isThinking = false
   -> Send button returns to Has-Input or Empty state based on current input
   -> Input re-enabled with original placeholder
```

---

### Flow: Hint Carousel Click

**Description:** User clicks a rotating hint to fill the composer input.

```
1. Hint carousel shows rotating suggestions (visible when no messages)

2. User clicks hint text
   -> chatInput.value = hint.text
   -> updateSendBtn() → send button becomes enabled
   -> chatInput.focus()

3. User can edit the hint text or send directly
```

---

### Flow: Link Hover Tooltip

**Description:** User hovers over a product link in an AI response.

```
1. User moves cursor over <a class="link"> in AI bubble

2. showLinkTip() fires
   -> Tooltip div positioned via getBoundingClientRect()
   -> Clamped to viewport edges
   -> Appears above link by default (below if no room)
   -> opacity: 0 → 1 (0.12s transition)
   -> Tooltip text = href URL

3. User moves cursor away
   -> opacity: 1 → 0
```

---

### Flow: Open / Close Widget

**Description:** User opens or closes the floating chat widget.

```
1. Widget is closed (launcher pill visible)
   -> User clicks launcher
   -> app.classList: closed → open
   -> chat-wrap display: none → flex
   -> pop keyframe plays (0.34s, bottom-right origin)

2. Widget is open
   -> User clicks close (×) in header
   -> popOut keyframe plays (0.22s)
   -> After 220ms: app.classList: open → closed
   -> chat-wrap hidden

3. Motion-off mode: animations skipped, transitions instant
```

---

### Flow: Error State

**Description:** Response fails (e.g. user types "error" keyword in demo).

```
1. System detects error condition during thinking phase
   -> Thinking bubble removed
   -> Error bubble added (red bg, triangle icon, error message, "Try again" button)
   -> isThinking = false, send button re-enabled

2. User clicks "Try again"
   -> Error bubble removed
   -> Last user message re-sent (sendMessage flow restarts from step 2)
```

---

## Gestures

| Element | Gesture | Action |
|---------|---------|--------|
| Send button (enabled) | Click | Submit message |
| Input | Enter key (no shift) | Submit message |
| Launcher pill | Click | Toggle open/close |
| Close button | Click | Close widget (popOut) |
| Hint text | Click | Fill input + focus |
| Product link | Hover | Show URL tooltip |
| Retry button | Click | Re-send last message |

---

## Micro-interactions

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Chat window open | pop: scale 0.94→1, opacity 0→1, translateY 10→0 | 0.34s cubic-bezier(0.2,0.9,0.3,1.2) |
| Chat window close | popOut: reverse of pop | 0.22s ease |
| New message appear | slide: opacity 0→1, translateY 8→0 | 0.32s cubic-bezier(0.2,0.9,0.3,1.1) |
| Thinking dots | bounce: translateY 0→-4→0, opacity 0.5→1→0.5 | 1.3s per dot, staggered +0.15s |
| Streaming caret | steps(2) blink | 1s infinite |
| Hint exit | opacity 1→0, translateY 0→-22px | 0.45s ease |
| Hint enter | opacity 0→1, translateY 22→0 | 0.45s ease |
| Send button hover | scale(1.06) | 0.15s |
| Launcher hover | translateY(-1px), brightness(1.05) | 0.15s |
| Link tooltip | opacity 0→1 | 0.12s |
| Send loading ring | stroke-dashoffset 56.55→0→-56.55 | 1.4s ease-in-out infinite |
| motion-off | All animations disabled | instant |

---

## Responsive Interactions

| Interaction | ≤840px | >840px |
|-------------|--------|--------|
| Widget size | Full screen width, full viewport height | 780×591px floating panel |
| User bubble indent | padding-right 20px | padding-right 90px |
| Open/close | Same launcher → same animation | Same |
| Input padding | 12px 14px | 16px 20px |
