import { Currency } from './types'

export const currencyConfig: Record<Currency, {
  locale: string
  symbol: string
  name: string
  flag: string
}> = {
  USD: { locale: 'en-US', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  VND: { locale: 'vi-VN', symbol: '₫', name: 'Việt Nam Đồng', flag: '🇻🇳' },
  CNY: { locale: 'zh-CN', symbol: '¥', name: '人民币', flag: '🇨🇳' },
  KRW: { locale: 'ko-KR', symbol: '₩', name: '대한민국 원', flag: '🇰🇷' },
  JPY: { locale: 'ja-JP', symbol: '¥', name: '日本円', flag: '🇯🇵' },
}

export function formatCurrency(amount: number, currency: Currency): string {
  const config = currencyConfig[currency]
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'VND' || currency === 'KRW' || currency === 'JPY' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${config.symbol}${amount.toLocaleString()}`
  }
}

export function formatCompactCurrency(amount: number, currency: Currency): string {
  const config = currencyConfig[currency]
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return `${config.symbol}${amount.toLocaleString()}`
  }
}
