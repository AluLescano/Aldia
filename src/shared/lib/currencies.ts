import type { Currency } from '@/features/settings/types'

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: 'U$S', countryCode: 'us' },
  { code: 'EUR', name: 'Euro', symbol: '€', countryCode: 'eu' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', countryCode: 'ar' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', countryCode: 'cl' },
  { code: 'GBP', name: 'British Pound', symbol: '£', countryCode: 'gb' },
]
