// All TypeScript Types for CRM System

export type Locale = 'en' | 'vi' | 'zh' | 'ko' | 'ja'
export type Currency = 'USD' | 'VND' | 'CNY' | 'KRW' | 'JPY'

// ─── Customer ────────────────────────────────────────────────────────────────
export type LeadSource = 'cold_call' | 'referral' | 'website' | 'event' | 'social' | 'partner' | 'other'
export type CustomerStatus = 'lead' | 'processing' | 'closed' | 'failed'

export interface ActivityLog {
  id: string
  type: 'note' | 'call' | 'meeting' | 'email' | 'task'
  content: string
  createdAt: string
  createdBy: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  company: string
  source: LeadSource
  status: CustomerStatus
  tags: string[]
  notes: ActivityLog[]
  dealIds: string[]
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// ─── Deal ─────────────────────────────────────────────────────────────────────
export type DealStatus = 'new' | 'processing' | 'negotiating' | 'closed_won' | 'closed_lost'

export interface TimelineEvent {
  id: string
  type: 'status_change' | 'note' | 'file' | 'meeting' | 'call'
  content: string
  fromStatus?: DealStatus
  toStatus?: DealStatus
  createdAt: string
  createdBy: string
}

export interface Deal {
  id: string
  name: string
  value: number
  currency: Currency
  status: DealStatus
  deadline: string
  description: string
  customerIds: string[]
  stakeholderIds: string[]
  commissions: Commission[]
  timeline: TimelineEvent[]
  tags: string[]
  assigneeId?: string
  bankId: string // Bank ID required for every deal
  createdAt: string
  updatedAt: string
}

// ─── Partner / Stakeholder ───────────────────────────────────────────────────
export type PartnerRole = 'sales' | 'partner' | 'broker' | 'internal' | 'external' | 'consultant' | 'legal'

export interface Partner {
  id: string
  name: string
  role: PartnerRole
  phone: string
  email: string
  company: string
  dealIds: string[]
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// ─── Commission ───────────────────────────────────────────────────────────────
export type CommissionStatus = 'pending' | 'paid'

export interface Commission {
  id: string
  dealId: string
  partnerId: string
  partnerName: string
  percentage: number
  amount: number
  currency: Currency
  status: CommissionStatus
  paidAt?: string
  note?: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  dealId?: string
  customerId?: string
  assigneeId?: string
  createdAt: string
  updatedAt: string
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'sales' | 'viewer'

export interface AppUser {
  id: string
  name: string
  email: string
  image?: string
  role: UserRole
  preferredLocale: Locale
  preferredCurrency: Currency
}

// ─── App Store ────────────────────────────────────────────────────────────────
export interface AppStore {
  customers: Customer[]
  deals: Deal[]
  partners: Partner[]
  tasks: Task[]
  users: AppUser[]
  settings: {
    defaultCurrency: Currency
    defaultLocale: Locale
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalDeals: number
  totalPipelineValue: number
  closedWonThisMonth: number
  closedWonValue: number
  newLeads: number
  tasksOverdue: number
  conversionRate: number
}
