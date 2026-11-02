import { afterEach, describe, expect, it, vi } from 'vitest'

import { convert, fetchExchangeRates, type ExchangeRates } from './exchangeRates'

/* A fake `fetch` answer with the API's shape: lowercase codes under `usd`. */
const apiAnswer = (date: string) =>
  new Response(JSON.stringify({ date, usd: { ars: 1500, eur: 0.9, usd: 1 } }))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchExchangeRates', () => {
  it('asks the server every time instead of reusing a cached copy', async () => {
    const fakeFetch = vi.fn().mockResolvedValue(apiAnswer('2026-11-02'))
    vi.stubGlobal('fetch', fakeFetch)

    await fetchExchangeRates()

    expect(fakeFetch).toHaveBeenCalledWith(expect.any(String), { cache: 'no-cache' })
  })

  it('returns the date and the rates with uppercase codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(apiAnswer('2026-11-02')))

    expect(await fetchExchangeRates()).toEqual({
      date: '2026-11-02',
      rates: { ARS: 1500, EUR: 0.9, USD: 1 },
    })
  })

  it('tries the fallback URL, also without the cache, when the first one fails', async () => {
    const fakeFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(apiAnswer('2026-11-01'))
    vi.stubGlobal('fetch', fakeFetch)

    const result = await fetchExchangeRates()

    expect(result.date).toBe('2026-11-01')
    expect(fakeFetch).toHaveBeenCalledTimes(2)
    expect(fakeFetch.mock.calls[0]?.[0]).not.toBe(fakeFetch.mock.calls[1]?.[0])
    expect(fakeFetch).toHaveBeenLastCalledWith(expect.any(String), { cache: 'no-cache' })
  })

  it('skips an answer that is not ok (a 404, for example)', async () => {
    const fakeFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('not found', { status: 404 }))
      .mockResolvedValueOnce(apiAnswer('2026-11-02'))
    vi.stubGlobal('fetch', fakeFetch)

    expect((await fetchExchangeRates()).date).toBe('2026-11-02')
  })

  it('throws when both URLs fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    await expect(fetchExchangeRates()).rejects.toThrow()
  })
})

describe('convert', () => {
  const rates: ExchangeRates = {
    date: '2026-11-02',
    rates: { ARS: 1500, EUR: 0.9, USD: 1 },
  }

  it('converts through the dollar', () => {
    expect(convert(10, 'USD', 'ARS', rates)).toBe(15000)
    expect(convert(9, 'EUR', 'USD', rates)).toBeCloseTo(10)
  })

  it('needs no rates for the same currency', () => {
    expect(convert(10, 'ARS', 'ARS', null)).toBe(10)
  })

  it('returns null when a rate is missing', () => {
    expect(convert(10, 'USD', 'ARS', null)).toBeNull()
    expect(convert(10, 'USD', 'BRL', rates)).toBeNull()
  })
})
