import Fuse from 'fuse.js'
import type { MatchResult } from 'src/types/chat'
import { mockDataService } from 'src/services/mock-data'

const THRESHOLD = 0.6

const FALLBACK: MatchResult = {
  content: "Sorry, I encountered an error. Please try again later.",
  score: 0,
  isFound: false,
  suggestedQuestion: null,
}

let fuse: Fuse<string> | null = null
let keys: string[] = []

async function ensureIndex(): Promise<void> {
  if (fuse) return
  const all = await mockDataService.getAll()
  keys = Object.keys(all)
  fuse = new Fuse(keys, {
    threshold: THRESHOLD,
    includeScore: true,
    isCaseSensitive: false,
    ignoreLocation: true,
    minMatchCharLength: 3,
  })
}

export async function match(input: string): Promise<MatchResult> {
  const trimmed = input.trim()
  if (!trimmed) return { ...FALLBACK }

  await ensureIndex()

  const results = fuse!.search(trimmed)
  if (!results.length) return { ...FALLBACK }

  const best = results[0]!
  if (best.score !== undefined && best.score > THRESHOLD) return { ...FALLBACK }

  const all = await mockDataService.getAll()
  const response = all[best.item]
  if (!response) return { ...FALLBACK }

  return {
    content: response.content,
    score: best.score ?? 0,
    isFound: true,
    suggestedQuestion: response.suggestedQuestion,
  }
}
