# Conventions

## Stack
- Vue 3.5 + Quasar 2 + Pinia + TypeScript + Vitest

## Component Rules
- Always `<script setup lang="ts">` — no Options API
- Reactive state: `ref()` for primitives, no `reactive()` wrappers
- Template refs: `useTemplateRef<T>('name')` (Vue 3.5+) — never callback refs
- No `v-html` — all dynamic content goes through `MarkdownRenderer`
- Styles: `<style scoped lang="scss">` — use `$token` SCSS vars, never bare hex literals

## Dependency Direction
```
IndexPage → chat-ui components → chat-rendering → md-renderer
IndexPage → chat-core (store)  → utils → types
matcher (service) → utils
```

## Service Layer
- `src/services/` — API clients only (currently: `matcher.ts`)
- `src/utils/` — side-effect-free utilities (`mock-data.ts`, `mock-stream.ts`)
- No `.vue` file imports directly from `src/mock/` — always go through `mockDataService`

## Streaming Pattern
```
match(input) → { stream: AsyncIterable<string>, suggestedQuestion }
store: for await (const chunk of stream) { turn.assistant.content += chunk }
TypewriterText(streaming=true) → MarkdownRenderer(:partial="true")
```

## Testing
- Framework: Vitest + @vue/test-utils (`mount`)
- Mocks: `vi.mock('src/services/matcher')` for store tests
- No mocking of utils — import directly

## CSS Tokens
- SCSS variables: `$teal-700`, `$orange-400`, `$white`, `$gray-*`, etc. (in `quasar.variables.scss`)
- CSS custom properties: `var(--text)`, `var(--bubble-ai)`, `var(--font-size-md)` (in `tokens.scss`)
