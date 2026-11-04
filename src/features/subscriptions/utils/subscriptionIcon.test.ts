import { describe, expect, it } from 'vitest'

import { iconSource, presetIcon } from './subscriptionIcon'
import type { Preset } from '@/shared/types'

describe('iconSource', () => {
  it.each([
    [
      { kind: 'preset', path: '/logos/logo_netflix.webp' } as const,
      { src: '/logos/logo_netflix.webp' },
    ],
    [{ kind: 'key', key: 'water' } as const, { iconKey: 'water' }],
    [{ kind: 'file', fileName: 'sub_1.webp' } as const, {}], // until the logo feature
    [undefined, {}],
  ])('%o draws %o', (icon, expected) => {
    expect(iconSource(icon)).toEqual(expected)
  })
})

describe('presetIcon', () => {
  const preset = (extra: Partial<Preset>) =>
    ({ id: 'p', name: 'P', defaultCategoryId: 'others', ...extra }) as Preset

  it('prefers the logo', () => {
    expect(presetIcon(preset({ iconUrl: '/logos/a.webp', iconKey: 'water' }))).toEqual({
      kind: 'preset',
      path: '/logos/a.webp',
    })
  })

  it('falls back to the built-in icon', () => {
    expect(presetIcon(preset({ iconKey: 'water' }))).toEqual({
      kind: 'key',
      key: 'water',
    })
  })

  it('has nothing without a preset or an icon', () => {
    expect(presetIcon(undefined)).toBeUndefined()
    expect(presetIcon(preset({}))).toBeUndefined()
  })
})
