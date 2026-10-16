import type { Currency, CurrencyCode } from '@/shared/types'

/** The currencies offered in the pickers, in display order. */
export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: 'U$S', countryCode: 'us' },
  { code: 'EUR', name: 'Euro', symbol: '€', countryCode: 'eu' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', countryCode: 'ar' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', countryCode: 'cl' },
  { code: 'GBP', name: 'Libra', symbol: '£', countryCode: 'gb' },
]

/**
 * The symbol to show before an amount ("U$S", "€", "$"...). Falls back to the
 * code itself for a currency outside the list.
 */
export const getCurrencySymbol = (code: CurrencyCode) =>
  DEFAULT_CURRENCIES.find((currency) => currency.code === code)?.symbol ?? code

// Argentine format: dot for thousands, comma for decimals, always 2 decimals
const amountFormat = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * An amount as people read it here, without the symbol.
 *
 * @example
 * formatAmount(15130.689) // '15.130,69'
 * formatAmount(10)        // '10,00'
 */
export const formatAmount = (amount: number) => amountFormat.format(amount)
