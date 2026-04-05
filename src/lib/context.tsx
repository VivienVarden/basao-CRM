'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  IntelligenceStore, Company, Person, Deal, Interaction, Relationship, OutreachItem,
  Locale, Currency
} from './types'
import { loadIntelligenceStore, saveStore, generateId, now } from './store'

interface IntelContextValue {
  store: IntelligenceStore
  locale: Locale
  setLocale: (l: Locale) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  
  // Basic API for mutating the intelligence store
  addPerson: (p: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Person
  updatePerson: (id: string, data: Partial<Person>) => void
  
  addCompany: (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company
  updateCompany: (id: string, data: Partial<Company>) => void
  
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Deal
  updateDeal: (id: string, data: Partial<Deal>) => void
  
  addInteraction: (i: Omit<Interaction, 'id'>) => Interaction
  
  addRelationship: (r: Omit<Relationship, 'id' | 'createdAt'>) => Relationship
  
  addOutreach: (o: Omit<OutreachItem, 'id' | 'createdAt'>) => OutreachItem
  updateOutreach: (id: string, data: Partial<OutreachItem>) => void
}

const IntelContext = createContext<IntelContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<IntelligenceStore>(() => loadIntelligenceStore())
  const [locale, setLocaleState] = useState<Locale>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('intel_locale') as Locale)) || 'en'
  )
  const [currency, setCurrencyState] = useState<Currency>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('intel_currency') as Currency)) || 'USD'
  )

  const setLocale = (l: Locale) => { setLocaleState(l); if (typeof window !== 'undefined') localStorage.setItem('intel_locale', l) }
  const setCurrency = (c: Currency) => { setCurrencyState(c); if (typeof window !== 'undefined') localStorage.setItem('intel_currency', c) }

  const mutate = useCallback((updater: (s: IntelligenceStore) => IntelligenceStore) => {
    setStore((prev: IntelligenceStore) => {
      const next = updater(prev)
      saveStore(next)
      return next
    })
  }, [])

  // ── People ──────────────────────────────────────────────────────────────
  const addPerson = useCallback((data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const person: Person = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    mutate(s => ({ ...s, people: [...s.people, person] }))
    return person
  }, [mutate])

  const updatePerson = useCallback((id: string, data: Partial<Person>) => {
    mutate(s => ({ ...s, people: s.people.map(p => p.id === id ? { ...p, ...data, updatedAt: now() } : p) }))
  }, [mutate])

  // ── Company ──────────────────────────────────────────────────────────
  const addCompany = useCallback((data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const org: Company = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    mutate(s => ({ ...s, companies: [...s.companies, org] }))
    return org
  }, [mutate])

  const updateCompany = useCallback((id: string, data: Partial<Company>) => {
    mutate(s => ({ ...s, companies: s.companies.map(o => o.id === id ? { ...o, ...data, updatedAt: now() } : o) }))
  }, [mutate])

  // ── Deal ──────────────────────────────────────────────────────────────────
  const addDeal = useCallback((data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const deal: Deal = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    mutate(s => ({ ...s, deals: [...s.deals, deal] }))
    return deal
  }, [mutate])

  const updateDeal = useCallback((id: string, data: Partial<Deal>) => {
    mutate(s => ({ ...s, deals: s.deals.map(d => d.id === id ? { ...d, ...data, updatedAt: now() } : d) }))
  }, [mutate])

  // ── Interaction ───────────────────────────────────────────────────────────
  const addInteraction = useCallback((data: Omit<Interaction, 'id'>) => {
    const interaction: Interaction = { ...data, id: generateId() }
    mutate(s => ({ ...s, interactions: [...s.interactions, interaction] }))
    return interaction
  }, [mutate])

  // ── Relationship ──────────────────────────────────────────────────────────
  const addRelationship = useCallback((data: Omit<Relationship, 'id' | 'createdAt'>) => {
    const rel: Relationship = { ...data, id: generateId(), createdAt: now() }
    mutate(s => ({ ...s, relationships: [...s.relationships, rel] }))
    return rel
  }, [mutate])

  // ── Outreach ──────────────────────────────────────────────────────────────
  const addOutreach = useCallback((data: Omit<OutreachItem, 'id' | 'createdAt'>) => {
    const item: OutreachItem = { ...data, id: generateId(), createdAt: now() }
    mutate(s => ({ ...s, outreachOutcomes: [...s.outreachOutcomes, item] }))
    return item
  }, [mutate])

  const updateOutreach = useCallback((id: string, data: Partial<OutreachItem>) => {
    mutate(s => ({ ...s, outreachOutcomes: s.outreachOutcomes.map(o => o.id === id ? { ...o, ...data } : o) }))
  }, [mutate])

  return (
    <IntelContext.Provider value={{
      store, locale, setLocale, currency, setCurrency,
      addPerson, updatePerson,
      addCompany, updateCompany,
      addDeal, updateDeal,
      addInteraction,
      addRelationship,
      addOutreach, updateOutreach
    }}>
      {children}
    </IntelContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(IntelContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
