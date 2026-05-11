# Nitra AI Chatroom — Constitution

> This document defines the core principles and constraints for the ai-chatroom-assignment project. All AI agents and developers must reference this document before making architectural or design decisions.

## Principles

### 1. Vue Composition API Only

**Description**: All components must use `<script setup lang="ts">`. Options API is prohibited. Use Vue 3.5+ APIs (`useTemplateRef`, `defineModel`) over older equivalents.

**Rationale**: Composition API provides better type inference, code organization, and tree-shaking. New Vue 3.5 APIs remove common anti-patterns (callback refs, workaround naming collisions).

**Enforcement**: No `defineOptions({ setup() {} })`, no `data()`, no `methods:`. All reactive state via `ref`/`computed`. Template refs via `useTemplateRef`.

---

### 2. Service Layer Encapsulation

**Description**: `src/services/` contains only API client code (real or mock) that matches a backend interface. Utility functions go in `src/utils/`. Components must not call `fetch`/`EventSource` directly.

**Rationale**: Ensures switching mock → real SSE requires only a change in `services/`, with zero changes to store or components.

**Enforcement**: No `fetch`/`axios`/`EventSource` in `.vue` files or `utils/`. All streaming interfaces typed as `AsyncIterable<string>`.

---

### 3. Type Safety — No `any`

**Description**: All store state, service return types, and component props must have explicit TypeScript definitions. `any` is prohibited except in narrow type-cast bridges (e.g., third-party library internal types).

**Rationale**: Catch errors at compile time; make store/service contracts self-documenting.

**Enforcement**: TypeScript strict mode. Use `unknown` + type guards instead of `any`. Minimal cast scope — cast as close to the boundary as possible.

---

### 4. Security — No `v-html`, URL Whitelist

**Description**: `v-html` is prohibited. All user-visible markdown must be rendered via `MarkdownRenderer` (streaming-markdown + custom safe renderer). External links must pass `^https?://` whitelist; unsafe URLs degrade to plain text. All external `<a>` elements require `rel="noopener noreferrer"` and `target="_blank"`.

**Rationale**: `v-html` with unsanitized content is a direct XSS vector. URL scheme whitelisting blocks `javascript:` and `data:` injection.

**Enforcement**: Grep for `v-html` in CI. `MarkdownRenderer` is the single rendering path for all AI response content.

---

### 5. SSE-Compatible Streaming Architecture

**Description**: All AI response delivery must be consumable as `AsyncIterable<string>`. The store consumes via `for await`. Mock implementations must use `AsyncGenerator`; real SSE must wrap `EventSource` in an async generator adaptor. TypewriterText must not contain business timing logic — animation is purely driven by reactive prop updates.

**Rationale**: Switching mock → production SSE requires replacing only the generator function inside `services/matcher.ts`, with zero changes to store or components.

**Enforcement**: `sendMessage` in `chat.ts` uses only `for await (const chunk of stream)`. No `setTimeout`-driven content accumulation in store.

---

### 6. CSS Architecture — Design Tokens First

**Description**: Colors, spacing, and typography must use design tokens (`var(--*)` or `$quasar-*` SCSS variables). Magic numbers in CSS require a comment justifying why a token doesn't apply. Scoped styles preferred; `:deep()` allowed only for styling library-injected or third-party DOM (e.g., `streaming-markdown` output).

**Rationale**: Token-based styles survive design system updates without grep-and-replace.

**Enforcement**: No hex color literals in component `<style>` blocks without a comment. `tokens.scss` is the single source of truth.

---

### 7. Accessibility Baseline

**Description**: All interactive elements (buttons, inputs, links) must have `aria-label` or visible text. Decorative SVGs must have `aria-hidden="true"`. Motion-sensitive animations must respect `prefers-reduced-motion` via `.motion-off` class or media query.

**Rationale**: WCAG 2.1 AA baseline; the `.motion-off` pattern already exists in the codebase and must be preserved.

**Enforcement**: No `<button>` or `<a>` without accessible text in new components.

---

## Constraints

- `src/services/` — API clients only; currently `matcher.ts` only
- `src/utils/` — pure functions, no Vue reactivity, no DOM access
- `src/stores/` — Pinia stores with `pinia-plugin-persistedstate` for persistence
- `src/components/` — single-responsibility Vue components; max ~200 lines per file
- `src/types/` — shared TypeScript interfaces; no runtime logic
- No direct `localStorage` manipulation in components; use Pinia persist
- No inline `style="..."` that duplicates token values; use CSS variables

---

## Quality Standards

- **Testing**: Every new `utils/` function and `services/` function must have unit tests. Vue components require tests for non-trivial interactions (emit, prop reactivity).
- **Test coverage target**: Business logic ≥ 80% statement coverage
- **Performance**: Streaming chunk render latency < 50ms per chunk (DELAY_MS=22 default)
- **Bundle**: No dependency > 50kB gzip without documented justification
- **Accessibility**: All new interactive elements pass axe-core automated checks

---

> Last updated: 2026-05-11
