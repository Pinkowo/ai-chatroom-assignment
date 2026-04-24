import { describe, it, expect, vi } from 'vitest'
import { match } from 'src/services/matcher'

vi.mock('src/services/mock-data', () => ({
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

describe('matcher', () => {
  it('matches gloves question to correct response', async () => {
    const result = await match('Can you help me compare gloves products from different vendors')
    expect(result.isFound).toBe(true)
    expect(result.content).toContain('glove products')
  })

  it('matches ultrasound gel question', async () => {
    const result = await match('most popular ultrasound gel products purchased by practices')
    expect(result.isFound).toBe(true)
    expect(result.content).toContain('ultrasound gel')
  })

  it('matches antibiotic ointments question', async () => {
    const result = await match('lowest price available for antibiotic ointments')
    expect(result.isFound).toBe(true)
    expect(result.content).toContain('antibiotic ointments')
  })

  it('matches surgical scissors question', async () => {
    const result = await match('prices for surgical scissors compare across vendors')
    expect(result.isFound).toBe(true)
    expect(result.content).toContain('surgical scissors')
  })

  it('matches masks substitutes question', async () => {
    const result = await match('find cheaper substitutes for my masks purchases')
    expect(result.isFound).toBe(true)
    expect(result.content).toContain('cost-effective')
  })

  it('returns fallback for unrelated input: "what is the weather today"', async () => {
    const result = await match('what is the weather today')
    expect(result.isFound).toBe(false)
    expect(result.content).toContain('Sorry')
  })

  it('returns fallback for unrelated input: "hello world"', async () => {
    const result = await match('hello world')
    expect(result.isFound).toBe(false)
  })

  it('returns fallback for unrelated input: "pizza recipe"', async () => {
    const result = await match('pizza recipe')
    expect(result.isFound).toBe(false)
  })

  it('returns fallback for whitespace-only input', async () => {
    const result = await match('   ')
    expect(result.isFound).toBe(false)
  })

  it('same input twice returns the same result', async () => {
    const input = 'Can you help me compare gloves products from different vendors'
    const r1 = await match(input)
    const r2 = await match(input)
    expect(r1.content).toBe(r2.content)
    expect(r1.isFound).toBe(r2.isFound)
  })
})
