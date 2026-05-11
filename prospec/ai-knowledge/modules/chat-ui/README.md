# chat-ui
> Widget shell, composer, and chrome components; orchestrates open/close and scroll behavior.

<!-- prospec:auto-start -->
## Key Files
| File | Role |
|------|------|
| `src/pages/IndexPage.vue` | Root widget: Launcher + animated chat panel + scroll loop |
| `src/components/ChatComposer.vue` | Text input + image attach + send button |
| `src/components/ChatHeader.vue` | Header bar with logo, title, close button |
| `src/components/Launcher.vue` | Fixed floating button that opens the widget |
| `src/components/HintCarousel.vue` | Rotating hint chips shown before first message |
| `src/components/ThinkingBubble.vue` | Animated "thinking" indicator during API call |

## Public API
**IndexPage** — no props; uses `useChatStore()`
- `<Transition name="chat-pop">` wraps `v-show="isOpen"` — enter 340ms, leave 220ms
- Scroll loop: `requestAnimationFrame` keeps latest chunk in view while `isThinking || suggestedAnimateTurnId`
- `userScrolledUp` ref locks auto-scroll when user scrolls up; releases when within 20px of bottom

**ChatComposer** — emits: `inputRef(el: HTMLInputElement | null)`
- `useTemplateRef<HTMLInputElement>('textInput')` — no callback refs
- Image preview via `URL.createObjectURL`; revoked on component unmount
- Max file size: 5MB (`MAX_FILE_SIZE` constant)

**HintCarousel** — props: `hasMessages`; emits: `select(text: string)`

## Dependencies
- **depends_on**: `chat-rendering` (ChatBubble, TypewriterText via IndexPage)
- **depends_on**: `chat-core` (useChatStore)
- **used_by**: none (top of dependency tree)

## Modification Guide
**To add a new composer action** (e.g. emoji picker):
1. Add button in ChatComposer `.chat-input__actions`.
2. Wire logic in `<script setup>`.
3. Keep `MAX_FILE_SIZE` guard pattern for any file/blob input.

**To change open/close animation**:
1. Edit `@keyframes chat-pop` / `chat-pop-out` in `IndexPage.vue`.
2. Update `<Transition :duration="{ enter: N, leave: N }">` to match CSS timing.

## Ripple Effects
- Changing `composerInputEl` wiring → `onHintSelect` focus call fails silently
- Removing `v-show` in favor of `v-if` → loses conversation history DOM state on close

## Pitfalls
- `requestAnimationFrame` scroll loop must be stopped in `onUnmounted` — `stopScrollLoop()` is called there
- `URL.revokeObjectURL` for image preview must NOT happen in `handleSubmit` — the URL is still needed by the bubble after send; revoke only in `onUnmounted` or `clearPreview`
- All CSS color values must use SCSS tokens (`$white`, `$teal-700`, etc.) — no bare hex literals
<!-- prospec:auto-end -->
<!-- prospec:user-start -->
<!-- prospec:user-end -->
