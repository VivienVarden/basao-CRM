import { Currency } from './types'

export const CURRENCIES: Record<Currency, { locale: string, symbol: string, name: string, flag: string }> = {
  VND: { locale: 'vi-VN', symbol: '₫', name: 'Việt Nam Đồng', flag: '🇻🇳' },
  USD: { locale: 'en-US', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
}

export function formatMoney(amount: number, currency: Currency): string {
  try {
    const config = CURRENCIES[currency] || CURRENCIES.USD
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount)
  } catch (error) {
    return `${amount} ${currency}`
  }
}
