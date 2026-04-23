import type { MockResponse } from 'src/types/chat'

const SUGGESTED_QUESTION_PREFIX = 'Suggested Question:'

interface RawMockEntry {
  message: {
    role: string
    content: string
    timestamp: string
  }
}

async function loadRawMap(): Promise<Record<string, RawMockEntry>> {
  const mod = await import('src/mock/messages.js')
  return mod.MESSAGE_MOCK_MAP as Record<string, RawMockEntry>
}

function parseEntry(entry: RawMockEntry): MockResponse {
  const raw = entry.message.content
  const idx = raw.lastIndexOf(SUGGESTED_QUESTION_PREFIX)
  if (idx === -1) {
    return { content: raw, suggestedQuestion: null }
  }
  const content = raw.slice(0, idx).trimEnd()
  const suggestedQuestion = raw.slice(idx + SUGGESTED_QUESTION_PREFIX.length).trim()
  return { content, suggestedQuestion: suggestedQuestion || null }
}

class MockDataService {
  private cache: Record<string, MockResponse> | null = null

  async getAll(): Promise<Record<string, MockResponse>> {
    if (this.cache) return this.cache
    const raw = await loadRawMap()
    this.cache = Object.fromEntries(
      Object.entries(raw).map(([key, entry]) => [key, parseEntry(entry)])
    )
    return this.cache
  }
}

export const mockDataService = new MockDataService()
