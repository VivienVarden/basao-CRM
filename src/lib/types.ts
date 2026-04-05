// All TypeScript Types for Deal Intelligence System

export type Locale = 'en' | 'vi'
export type Currency = 'USD' | 'VND'

// ─── Company ─────────────────────────────────────────────────────────────
export type CompanyType = 'Startup' | 'VC' | 'PE' | 'Corp'

export interface Company {
  id: string
  name: string
  type: CompanyType
  industry: string
  stage: string // e.g., 'Series A', 'Seed', 'Public', 'N/A'
  website?: string
  logo?: string
  createdAt: string
  updatedAt: string
}

// ─── Person ───────────────────────────────────────────────────────────────────
export type PersonRole = 'Founder' | 'Investor' | 'Partner' | 'Operator'

export interface Person {
  id: string
  name: string
  role: PersonRole
  company_id?: string
  email: string
  linkedin?: string
  tier_score: number // 1, 2, 3
  relationship_score: number // 0-100 indicating strength of connection
  lastInteractionDate?: string
  avatarUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Relationship (Graph Edge) ─────────────────────────────────────────────────
export type RelationshipType = 'knows' | 'introduced' | 'worked_with' | 'invested_in' | 'advises'

export interface Relationship {
  id: string
  personIdA: string // The source person
  personIdB: string // The target person
  type: RelationshipType
  strengthScore: number // 0-100
  notes?: string
  createdAt: string
}

// ─── Deal ─────────────────────────────────────────────────────────────────────
export type DealType = 'Fundraising' | 'Partnership' | 'Sales'
export type DealStage = 'Sourcing' | 'Intro' | 'Meeting' | 'IC' | 'Term Sheet' | 'Close'
export type DealStatus = 'Active' | 'Won' | 'Lost' | 'On Hold'

export interface Deal {
  id: string
  name: string
  company_id: string
  type: DealType
  stage: DealStage
  value: number
  status: DealStatus
  currency: Currency
  ownerId: string // Internal user managing the deal
  sourceId?: string // personId who introduced or provided the leverage
  probability: number // 0-100%
  expectedCloseDate?: string
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Interaction ──────────────────────────────────────────────────────────────
export type InteractionType = 'Email' | 'Meeting' | 'Intro' | 'Call'

export interface Interaction {
  id: string
  type: InteractionType
  personId: string
  dealId?: string
  timestamp: string // When it happened
  content: string // Notes or actual email body summary
  sentiment?: 'positive' | 'neutral' | 'negative'
  nextStepReminder?: string // Follow-up reminder date or text
  createdBy: string
}

// ─── Outreach / Action ────────────────────────────────────────────────────────
export type OutreachStatus = 'not_contacted' | 'contacted' | 'replied' | 'meeting_booked'

export interface OutreachItem {
  id: string
  personId: string
  dealId?: string
  status: OutreachStatus
  lastContactedAt?: string
  followUpDate?: string
  notes?: string
  createdAt: string
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'bd' | 'viewer'

export interface AppUser {
  id: string
  name: string
  email: string
  image?: string
  role: UserRole
  preferredLocale: Locale
  preferredCurrency: Currency
}

// ─── Application Intelligence Store ───────────────────────────────────────────
export interface IntelligenceStore {
  companies: Company[]
  people: Person[]
  relationships: Relationship[]
  deals: Deal[]
  interactions: Interaction[]
  outreachOutcomes: OutreachItem[]
  users: AppUser[]
  settings: {
    defaultCurrency: Currency
    defaultLocale: Locale
  }
}
