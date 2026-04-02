'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  AppStore, Customer, Deal, Partner, Task, Commission,
  Locale, Currency, ActivityLog, TimelineEvent
} from './types'
import { loadStore, saveStore, generateId, now } from './store'

interface AppContextValue {
  store: AppStore
  locale: Locale
  setLocale: (l: Locale) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'dealIds'>) => Customer
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addCustomerNote: (customerId: string, content: string, type?: string) => void
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'commissions'>) => Deal
  updateDeal: (id: string, data: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  addDealTimelineEvent: (dealId: string, content: string, type?: string) => void
  addPartner: (p: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'dealIds'>) => Partner
  updatePartner: (id: string, data: Partial<Partner>) => void
  deletePartner: (id: string) => void
  addCommission: (dealId: string, c: Omit<Commission, 'id' | 'dealId'>) => void
  updateCommission: (dealId: string, commissionId: string, data: Partial<Commission>) => void
  removeCommission: (dealId: string, commissionId: string) => void
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore>(() => loadStore())
  const [locale, setLocaleState] = useState<Locale>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('crm_locale') as Locale)) || 'vi'
  )
  const [currency, setCurrencyState] = useState<Currency>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('crm_currency') as Currency)) || 'VND'
  )

  const setLocale = (l: Locale) => { setLocaleState(l); if (typeof window !== 'undefined') localStorage.setItem('crm_locale', l) }
  const setCurrency = (c: Currency) => { setCurrencyState(c); if (typeof window !== 'undefined') localStorage.setItem('crm_currency', c) }

  const mutate = useCallback((updater: (s: AppStore) => AppStore) => {
    setStore((prev: AppStore) => {
      const next = updater(prev)
      saveStore(next)
      return next
    })
  }, [])

  // ── Customer ──────────────────────────────────────────────────────────────
  const addCustomer = useCallback((data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'dealIds'>) => {
    const customer: Customer = { ...data, id: generateId(), notes: [], dealIds: [], createdAt: now(), updatedAt: now() }
    mutate((s: AppStore) => ({ ...s, customers: [...s.customers, customer] }))
    return customer
  }, [mutate])

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    mutate((s: AppStore) => ({ ...s, customers: s.customers.map((c: Customer) => c.id === id ? { ...c, ...data, updatedAt: now() } : c) }))
  }, [mutate])

  const deleteCustomer = useCallback((id: string) => {
    mutate((s: AppStore) => ({ ...s, customers: s.customers.filter((c: Customer) => c.id !== id) }))
  }, [mutate])

  const addCustomerNote = useCallback((customerId: string, content: string, type = 'note') => {
    const note: ActivityLog = { id: generateId(), type: type as ActivityLog['type'], content, createdAt: now(), createdBy: 'Admin' }
    mutate((s: AppStore) => ({ ...s, customers: s.customers.map((c: Customer) => c.id === customerId ? { ...c, notes: [...c.notes, note], updatedAt: now() } : c) }))
  }, [mutate])

  // ── Deal ──────────────────────────────────────────────────────────────────
  const addDeal = useCallback((data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'commissions'>) => {
    const deal: Deal = { ...data, id: generateId(), timeline: [], commissions: [], createdAt: now(), updatedAt: now() }
    mutate((s: AppStore) => ({ ...s, deals: [...s.deals, deal] }))
    return deal
  }, [mutate])

  const updateDeal = useCallback((id: string, data: Partial<Deal>) => {
    mutate((s: AppStore) => ({ ...s, deals: s.deals.map((d: Deal) => d.id === id ? { ...d, ...data, updatedAt: now() } : d) }))
  }, [mutate])

  const deleteDeal = useCallback((id: string) => {
    mutate((s: AppStore) => ({ ...s, deals: s.deals.filter((d: Deal) => d.id !== id) }))
  }, [mutate])

  const addDealTimelineEvent = useCallback((dealId: string, content: string, type = 'note') => {
    const event: TimelineEvent = { id: generateId(), type: type as TimelineEvent['type'], content, createdAt: now(), createdBy: 'Admin' }
    mutate((s: AppStore) => ({ ...s, deals: s.deals.map((d: Deal) => d.id === dealId ? { ...d, timeline: [...d.timeline, event], updatedAt: now() } : d) }))
  }, [mutate])

  // ── Partner ───────────────────────────────────────────────────────────────
  const addPartner = useCallback((data: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'dealIds'>) => {
    const partner: Partner = { ...data, id: generateId(), dealIds: [], createdAt: now(), updatedAt: now() }
    mutate((s: AppStore) => ({ ...s, partners: [...s.partners, partner] }))
    return partner
  }, [mutate])

  const updatePartner = useCallback((id: string, data: Partial<Partner>) => {
    mutate((s: AppStore) => ({ ...s, partners: s.partners.map((p: Partner) => p.id === id ? { ...p, ...data, updatedAt: now() } : p) }))
  }, [mutate])

  const deletePartner = useCallback((id: string) => {
    mutate((s: AppStore) => ({ ...s, partners: s.partners.filter((p: Partner) => p.id !== id) }))
  }, [mutate])

  // ── Commission ────────────────────────────────────────────────────────────
  const addCommission = useCallback((dealId: string, data: Omit<Commission, 'id' | 'dealId'>) => {
    const commission: Commission = { ...data, id: generateId(), dealId }
    mutate((s: AppStore) => ({ ...s, deals: s.deals.map((d: Deal) => d.id === dealId ? { ...d, commissions: [...d.commissions, commission] } : d) }))
  }, [mutate])

  const updateCommission = useCallback((dealId: string, commissionId: string, data: Partial<Commission>) => {
    mutate((s: AppStore) => ({ ...s, deals: s.deals.map((d: Deal) => d.id === dealId ? { ...d, commissions: d.commissions.map((c: Commission) => c.id === commissionId ? { ...c, ...data } : c) } : d) }))
  }, [mutate])

  const removeCommission = useCallback((dealId: string, commissionId: string) => {
    mutate((s: AppStore) => ({ ...s, deals: s.deals.map((d: Deal) => d.id === dealId ? { ...d, commissions: d.commissions.filter((c: Commission) => c.id !== commissionId) } : d) }))
  }, [mutate])

  // ── Task ──────────────────────────────────────────────────────────────────
  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    mutate((s: AppStore) => ({ ...s, tasks: [...s.tasks, task] }))
    return task
  }, [mutate])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    mutate((s: AppStore) => ({ ...s, tasks: s.tasks.map((t: Task) => t.id === id ? { ...t, ...data, updatedAt: now() } : t) }))
  }, [mutate])

  const deleteTask = useCallback((id: string) => {
    mutate((s: AppStore) => ({ ...s, tasks: s.tasks.filter((t: Task) => t.id !== id) }))
  }, [mutate])

  return (
    <AppContext.Provider value={{
      store, locale, setLocale, currency, setCurrency,
      addCustomer, updateCustomer, deleteCustomer, addCustomerNote,
      addDeal, updateDeal, deleteDeal, addDealTimelineEvent,
      addPartner, updatePartner, deletePartner,
      addCommission, updateCommission, removeCommission,
      addTask, updateTask, deleteTask,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
