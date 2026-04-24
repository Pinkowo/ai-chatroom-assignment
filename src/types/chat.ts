export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  imageUrl?: string
}

export interface ConversationTurn {
  user: Message
  assistant: Message
  suggestedQuestion: string | null
}

export interface MatchResult {
  content: string
  score: number
  isFound: boolean
  suggestedQuestion: string | null
}

export interface MockResponse {
  content: string
  suggestedQuestion: string | null
}
