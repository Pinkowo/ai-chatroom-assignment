import { describe, it, expect, vi } from 'vitest'
import { match } from 'src/services/matcher'

vi.mock('src/utils/mock-data', () => ({
  mockDataService: {
    getAll: vi.fn().mockResolvedValue({
      'Can you help me compare gloves products from different vendors?': {
        content: 'Here are some glove products from different vendors for comparison...',
        suggestedQuestion: 'Would you like me to highlight the best value option for your needs?',
      },
      'What are the most popular ultrasound gel products purchased by practices like mine?': {
        content: 'Here is a selection of ultrasound gel products...',
        suggestedQuestion: 'Would you like me to place an order for any of these ultrasound gel products?',
      },
      'What product has the lowest price available for antibiotic ointments?': {
        content: 'Here is the product with the lowest price available for antibiotic ointments...',
        suggestedQuestion: 'Would you like to know about other antiseptic products available in the same price range?',
      },
      'How do prices for surgical scissors compare across vendors?': {
        content: 'Here is a comparison of prices for surgical scissors across different vendors...',
        suggestedQuestion: 'Would you like me to highlight the best value option for your needs?',
      },
      'Can you find cheaper substitutes for my masks purchases?': {
        content: 'Certainly! Here are some cost-effective alternatives...',
        suggestedQuestion: 'Would you like me to place an order for any of these cost-effective medical supplies?',
      },
    }),
  },
}))

async function collectStream(stream: AsyncIterable<string>): Promise<string> {
  let result = ''
  for await (const chunk of stream) {
    result += chunk
  }
  return result
}

describe('matcher', () => {
  it('matches gloves question to correct response', async () => {
    const result = await match('Can you help me compare gloves products from different vendors')
    const content = await collectStream(result.stream)
    expect(content).toContain('glove products')
    expect(result.suggestedQuestion).not.toBeNull()
  })

  it('matches ultrasound gel question', async () => {
    const result = await match('most popular ultrasound gel products purchased by practices')
    const content = await collectStream(result.stream)
    expect(content).toContain('ultrasound gel')
    expect(result.suggestedQuestion).not.toBeNull()
  })

  it('matches antibiotic ointments question', async () => {
    const result = await match('lowest price available for antibiotic ointments')
    const content = await collectStream(result.stream)
    expect(content).toContain('antibiotic ointments')
  })

  it('matches surgical scissors question', async () => {
    const result = await match('prices for surgical scissors compare across vendors')
    const content = await collectStream(result.stream)
    expect(content).toContain('surgical scissors')
  })

  it('matches masks substitutes question', async () => {
    const result = await match('find cheaper substitutes for my masks purchases')
    const content = await collectStream(result.stream)
    expect(content).toContain('cost-effective')
  })

  it('returns fallback for unrelated input: "what is the weather today"', async () => {
    const result = await match('what is the weather today')
    const content = await collectStream(result.stream)
    expect(content).toContain('Sorry')
    expect(result.suggestedQuestion).toBeNull()
  })

  it('returns fallback for unrelated input: "hello world"', async () => {
    const result = await match('hello world')
    const content = await collectStream(result.stream)
    expect(content).toContain('Sorry')
    expect(result.suggestedQuestion).toBeNull()
  })

  it('returns fallback for unrelated input: "pizza recipe"', async () => {
    const result = await match('pizza recipe')
    const content = await collectStream(result.stream)
    expect(content).toContain('Sorry')
    expect(result.suggestedQuestion).toBeNull()
  })

  it('returns fallback for whitespace-only input', async () => {
    const result = await match('   ')
    const content = await collectStream(result.stream)
    expect(content).toContain('Sorry')
    expect(result.suggestedQuestion).toBeNull()
  })

  it('same input twice returns the same kind of result', async () => {
    const input = 'Can you help me compare gloves products from different vendors'
    const r1 = await match(input)
    const r2 = await match(input)
    const c1 = await collectStream(r1.stream)
    const c2 = await collectStream(r2.stream)
    expect(c1).toBe(c2)
    expect(r1.suggestedQuestion).toBe(r2.suggestedQuestion)
  })
})
