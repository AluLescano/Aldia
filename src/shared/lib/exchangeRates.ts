// UTILS
import { formatDate } from './formatDate'
import { daysBetween } from './isoDate'

// TYPES
import type { CurrencyCode } from '@/shared/types'

/** Rates this many days old or more get mentioned under a converted total. */
const STALE_RATES_DAYS = 2

/** A day's exchange rates: how much of each currency one US dollar buys. */
export interface ExchangeRates {
  /** The day the rates are from, as `YYYY-MM-DD`. */
  date: string
  /** Units per 1 USD, keyed by uppercase code (`{ ARS: 1513.07, EUR: 0.89, USD: 1, ... }`). */
  rates: Record<string, number>
}

// Free API, no key, updated daily (github.com/fawazahmed0/exchange-api). The second URL is its fallback.
const RATE_URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
  'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json',
]

/**
 * Downloads today's rates, trying the fallback URL if the first one fails.
 * This is the only network request of the app: no user data is sent.
 * `cache: 'no-cache'` makes the WebView check with the server before reusing its copy:
 * jsDelivr says the file is good for 7 days, which froze the rates for a week.
 *
 * @throws when both URLs fail (offline, for example).
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  for (const url of RATE_URLS) {
    try {
      const response = await fetch(url, { cache: 'no-cache' })
      if (!response.ok) continue
      const json = (await response.json()) as {
        date: string
        usd: Record<string, number>
      }
      const rates = Object.fromEntries(
        Object.entries(json.usd).map(([code, rate]) => [code.toUpperCase(), rate]),
      )
      return { date: json.date, rates }
    } catch {
      // try the next URL
    }
  }
  throw new Error('No se pudieron descargar las tasas de cambio')
}

/**
 * Converts an amount between currencies through the dollar. Pure: works offline
 * with whatever rates it is given.
 *
 * @returns the converted amount, or `null` when a rate is missing (no rates yet,
 * or a currency the API does not know). The same currency never needs rates.
 * @example
 * convert(10, 'USD', 'ARS', rates) // 15130.69
 */
export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates | null,
): number | null {
  if (from === to) return amount
  const fromRate = rates?.rates[from]
  const toRate = rates?.rates[to]
  if (!fromRate || !toRate) return null
  return (amount / fromRate) * toRate
}

/**
 * The honest line under a converted total: says when part of it is missing (no rate) or
 * uses old rates. `undefined` when there's nothing to say. Home's monthly total and the
 * Calendario's month total both show it.
 *
 * @param converted how many amounts were converted (old rates only matter then).
 * @param unconverted how many were left out for lack of a rate.
 * @example
 * ratesNote(0, 1, rates, '2026-11-07') // '1 sin sumar: faltan tasas de cambio'
 * ratesNote(2, 0, { date: '2026-11-03', rates }, '2026-11-07') // 'Tasas del 03 Nov 26'
 */
export function ratesNote(
  converted: number,
  unconverted: number,
  rates: ExchangeRates | null,
  today: string,
): string | undefined {
  if (unconverted > 0) return `${unconverted} sin sumar: faltan tasas de cambio`
  if (converted > 0 && rates && daysBetween(rates.date, today) >= STALE_RATES_DAYS)
    return `Tasas del ${formatDate(rates.date)}`
  return undefined
}
