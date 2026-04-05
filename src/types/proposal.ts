import type { Json } from './database'

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'signed'
  | 'won'
  | 'lost'

export interface TimelinePhase {
  phase: string
  duration: string
  description: string
}

export interface PricingRow {
  item: string
  description: string
  amount: string
}

export interface ScoreFeedbackItem {
  type: 'strength' | 'warning'
  message: string
}

export interface ProposalContent {
  title?: string
  executive_summary?: string
  understanding?: string
  scope?: string[]
  exclusions?: string[]
  timeline?: TimelinePhase[]
  pricing?: PricingRow[]
  total?: string
  payment_terms?: string
  why_us?: string
  terms?: string[]
  next_steps?: string
  score?: number
  score_feedback?: ScoreFeedbackItem[]
}

export function parseProposalContent(raw: Json): ProposalContent {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as ProposalContent
  }
  return {}
}
