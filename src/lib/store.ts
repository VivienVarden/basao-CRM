import { v4 as uuidv4 } from 'uuid'
import {
  IntelligenceStore, Company, Person, Relationship, Deal, Interaction, OutreachItem
} from './types'

const STORE_KEY = 'intel_data_v2'

// ─── Seed Data ─────────────────────────────────────────────────────────────────
function generateSeedData(): IntelligenceStore {
  const now = new Date().toISOString()
  const days = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

  // Companies
  const companies: Company[] = [
    { id: 'o1', name: 'FocusLab AI', type: 'Startup', industry: 'AI SaaS', stage: 'Series A', website: 'focuslab.ai', createdAt: now, updatedAt: now },
    { id: 'o2', name: 'Stripe', type: 'Corp', industry: 'Fintech', stage: 'Public', website: 'stripe.com', createdAt: now, updatedAt: now },
    { id: 'o3', name: 'Sequoia Capital', type: 'VC', industry: 'Venture Capital', stage: 'N/A', website: 'sequoiacap.com', createdAt: now, updatedAt: now },
    { id: 'o4', name: 'DataRobot', type: 'Startup', industry: 'AI', stage: 'Series F', website: 'datarobot.com', createdAt: now, updatedAt: now },
  ]

  // People
  const people: Person[] = [
    { id: 'p1', name: 'Roelof Botha', role: 'Investor', company_id: 'o3', email: 'roelof@sequoia.com', linkedin: 'roelofbotha', tier_score: 1, relationship_score: 85, lastInteractionDate: days(-2), tags: ['strategic', 'vc_board'], createdAt: now, updatedAt: now },
    { id: 'p2', name: 'Sam Altman', role: 'Operator', company_id: 'o2', email: 'sam@openai.com', linkedin: 'samaltman', tier_score: 2, relationship_score: 40, lastInteractionDate: days(-30), tags: ['ai', 'operator'], createdAt: now, updatedAt: now },
    { id: 'p3', name: 'Alex Wang', role: 'Founder', company_id: 'o1', email: 'alex@focuslab.ai', linkedin: 'alexwang', tier_score: 1, relationship_score: 92, lastInteractionDate: days(0), tags: ['hot_deal', 'founder'], createdAt: now, updatedAt: now },
    { id: 'p4', name: 'Jeremy Achin', role: 'Founder', company_id: 'o4', email: 'jeremy@datarobot.com', linkedin: 'jeremyachin', tier_score: 3, relationship_score: 15, tags: ['ex_founder', 'ai'], createdAt: now, updatedAt: now },
    { id: 'p5', name: 'Patrick Collison', role: 'Founder', company_id: 'o2', email: 'patrick@stripe.com', linkedin: 'patrickc', tier_score: 2, relationship_score: 60, lastInteractionDate: days(-15), tags: ['fintech', 'founder'], createdAt: now, updatedAt: now },
  ]

  // Relationships (The intelligence graph)
  const relationships: Relationship[] = [
    { id: uuidv4(), personIdA: 'p1', personIdB: 'p3', type: 'invested_in', strengthScore: 95, notes: 'Lead Series A for FocusLab', createdAt: now },
    { id: uuidv4(), personIdA: 'p2', personIdB: 'p5', type: 'knows', strengthScore: 80, notes: 'Y-Combinator network', createdAt: now },
    { id: uuidv4(), personIdA: 'p1', personIdB: 'p5', type: 'invested_in', strengthScore: 90, notes: 'Early backing in Stripe', createdAt: now },
    { id: uuidv4(), personIdA: 'p4', personIdB: 'p3', type: 'advises', strengthScore: 65, notes: 'Helped Alex with ML models', createdAt: now },
  ]

  // Deals
  const deals: Deal[] = [
    { id: 'd1', name: 'FocusLab AI Series B', company_id: 'o1', type: 'Fundraising', stage: 'IC', value: 15000000, status: 'Active', currency: 'USD', ownerId: 'user_1', sourceId: 'p1', probability: 80, expectedCloseDate: days(14), tags: ['ai', 'series-b'], notes: 'Strong traction, Roelof strongly recommends.', createdAt: days(-45), updatedAt: now },
    { id: 'd2', name: 'Stripe Enterprise Commits', company_id: 'o2', type: 'Sales', stage: 'Intro', value: 2000000, status: 'Active', currency: 'USD', ownerId: 'user_1', sourceId: 'p2', probability: 20, expectedCloseDate: days(90), tags: ['fintech', 'enterprise'], notes: 'Sam making intro to Patrick.', createdAt: days(-5), updatedAt: now },
    { id: 'd3', name: 'DataRobot Acquisition Target', company_id: 'o4', type: 'Partnership', stage: 'Meeting', value: 85000000, status: 'Active', currency: 'USD', ownerId: 'user_1', sourceId: 'p4', probability: 45, expectedCloseDate: days(120), tags: ['m&a', 'ai'], notes: 'Initial meeting setup to discuss synergies.', createdAt: days(-10), updatedAt: now },
  ]

  // Interactions
  const interactions: Interaction[] = [
    { id: uuidv4(), type: 'Meeting', personId: 'p1', dealId: 'd1', timestamp: days(-2), content: 'Coffee in Menlo Park. Roelof signaled strong confidence in FocusLab trajectory.', sentiment: 'positive', createdBy: 'user_1' },
    { id: uuidv4(), type: 'Email', personId: 'p3', dealId: 'd1', timestamp: days(0), content: 'Sent over data room for IC review prep.', sentiment: 'neutral', nextStepReminder: days(2), createdBy: 'user_1' },
    { id: uuidv4(), type: 'Intro', personId: 'p2', dealId: 'd2', timestamp: days(-5), content: 'Sam cc\'d Patrick on email describing our platform value.', sentiment: 'positive', createdBy: 'user_1' },
  ]

  // Outreach Tracking
  const outreachOutcomes: OutreachItem[] = [
    { id: uuidv4(), personId: 'p3', dealId: 'd1', status: 'meeting_booked', lastContactedAt: now, followUpDate: days(2), notes: 'IC follow-up scheduled.', createdAt: now },
    { id: uuidv4(), personId: 'p5', dealId: 'd2', status: 'contacted', lastContactedAt: days(-5), followUpDate: days(1), notes: 'Waiting for Patrick to reply to Sam\'s intro.', createdAt: days(-5) },
    { id: uuidv4(), personId: 'p4', dealId: 'd3', status: 'replied', lastContactedAt: days(-2), followUpDate: days(3), notes: 'Available next Thursday.', createdAt: days(-10) },
  ]

  return {
    companies,
    people,
    relationships,
    deals,
    interactions,
    outreachOutcomes,
    users: [{ id: 'user_1', name: 'BD Lead', email: 'user@intelligence.local', role: 'bd', preferredLocale: 'en', preferredCurrency: 'USD' }],
    settings: { defaultCurrency: 'USD', defaultLocale: 'en' },
  }
}

// ─── Store API ─────────────────────────────────────────────────────────────────
export function loadIntelligenceStore(): IntelligenceStore {
  if (typeof window === 'undefined') return generateSeedData()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      const seed = generateSeedData()
      saveStore(seed)
      return seed
    }
    return JSON.parse(raw) as IntelligenceStore
  } catch {
    return generateSeedData()
  }
}

export function saveStore(store: IntelligenceStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function resetStore(): IntelligenceStore {
  const seed = generateSeedData()
  saveStore(seed)
  return seed
}

export function generateId(): string {
  return uuidv4()
}

export function now(): string {
  return new Date().toISOString()
}
