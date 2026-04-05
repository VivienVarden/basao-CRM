import { Locale } from './types'

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  vi: '🇻🇳',
}

type Translations = Record<string, string>

const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.pipeline': 'Pipeline',
    'nav.deals': 'Deals',
    'nav.settings': 'Settings',
  },
  vi: {
    'nav.dashboard': 'Bảng điều khiển',
    'nav.pipeline': 'Quy trình',
    'nav.deals': 'Giao dịch',
    'nav.settings': 'Cài đặt',
  }
}

export function t(locale: Locale, key: keyof typeof TRANSLATIONS['en']): string {
  return TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en'][key] || key as string
}
