'use client'
import { useApp } from '@/lib/context'
import { localeNames, localeFlags } from '@/lib/i18n'
import { currencyConfig } from '@/lib/currencies'
import { Locale, Currency } from '@/lib/types'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { locale, setLocale, currency, setCurrency } = useApp()
  const [langOpen, setLangOpen] = useState(false)
  const [curOpen, setCurOpen] = useState(false)

  const locales: Locale[] = ['en', 'vi', 'zh', 'ko', 'ja']
  const currencies: Currency[] = ['VND', 'USD', 'CNY', 'KRW', 'JPY']

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="header-title">{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div className="header-right">
        {actions}

        {/* Language Switcher */}
        <div className="dropdown">
          <button className="btn btn-ghost btn-sm" onClick={() => { setLangOpen(v => !v); setCurOpen(false) }}
            style={{ gap: 4, fontSize: 14 }}>
            {localeFlags[locale]} {localeNames[locale]}
            <span style={{ fontSize: 10 }}>▼</span>
          </button>
          {langOpen && (
            <div className="dropdown-menu" style={{ minWidth: 140 }}>
              {locales.map(l => (
                <button key={l} className={`dropdown-item ${l === locale ? 'active' : ''}`}
                  onClick={() => { setLocale(l); setLangOpen(false) }}
                  style={{ fontWeight: l === locale ? 600 : 400, color: l === locale ? 'var(--accent)' : undefined }}>
                  {localeFlags[l]} {localeNames[l]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="dropdown">
          <button className="btn btn-ghost btn-sm" onClick={() => { setCurOpen(v => !v); setLangOpen(false) }}
            style={{ gap: 4, fontSize: 14 }}>
            {currencyConfig[currency].flag} {currency}
            <span style={{ fontSize: 10 }}>▼</span>
          </button>
          {curOpen && (
            <div className="dropdown-menu">
              {currencies.map(c => (
                <button key={c} className={`dropdown-item`}
                  onClick={() => { setCurrency(c); setCurOpen(false) }}
                  style={{ fontWeight: c === currency ? 600 : 400, color: c === currency ? 'var(--accent)' : undefined }}>
                  {currencyConfig[c].flag} {c} — {currencyConfig[c].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
