import Fuse from 'fuse.js'
import { mockDataService } from 'src/utils/mock-data'
import { createMockStream } from 'src/utils/mock-stream'

const THRESHOLD = 0.6

const FALLBACK_CONTENT = "Sorry, I encountered an error. Please try again later."

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

export async function match(input: string): Promise<{ stream: AsyncIterable<string>, suggestedQuestion: string | null }> {
  const trimmed = input.trim()
  if (!trimmed) return { stream: createMockStream(FALLBACK_CONTENT), suggestedQuestion: null }

  await ensureIndex()

  const results = fuse!.search(trimmed)
  if (!results.length) return { stream: createMockStream(FALLBACK_CONTENT), suggestedQuestion: null }

  const best = results[0]!
  if (best.score !== undefined && best.score > THRESHOLD) return { stream: createMockStream(FALLBACK_CONTENT), suggestedQuestion: null }

  const all = await mockDataService.getAll()
  const response = all[best.item]
  if (!response) return { stream: createMockStream(FALLBACK_CONTENT), suggestedQuestion: null }

  return {
    stream: createMockStream(response.content),
    suggestedQuestion: response.suggestedQuestion,
  }
}
