export async function* createMockStream(content: string): AsyncGenerator<string> {
  const CHUNK_SIZE = 3
  const DELAY_MS = 22
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    yield content.slice(i, i + CHUNK_SIZE)
    await new Promise<void>((r) => setTimeout(r, DELAY_MS))
  }
}
