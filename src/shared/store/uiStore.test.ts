import { beforeEach, describe, expect, it } from 'vitest'

import { useUIStore } from './uiStore'

// TYPES
import type { Preset } from '@/shared/types'

const netflix: Preset = { id: 'netflix', name: 'Netflix', defaultCategoryId: 'streaming' }
const spotify: Preset = { id: 'spotify', name: 'Spotify', defaultCategoryId: 'music' }

const ui = () => useUIStore.getState()
const types = () => ui().overlays.map((overlay) => overlay.type)

beforeEach(() => {
  useUIStore.setState(useUIStore.getInitialState())
})

describe('pushOverlay', () => {
  it('stacks screens, the last one on top', () => {
    ui().pushOverlay('preset-picker')
    ui().pushOverlay('subscription-form', { preset: netflix })

    expect(types()).toEqual(['preset-picker', 'subscription-form'])
    expect(ui().overlays[1].data).toEqual({ preset: netflix })
  })

  // Felipe's stress test: spam-tapping a card stacked the same detail screen several times
  it('ignores a push equal to the top screen (fast repeated taps)', () => {
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })

    expect(ui().overlays).toHaveLength(1)
  })

  it('ignores a repeated push with no data (the + button)', () => {
    ui().pushOverlay('preset-picker')
    ui().pushOverlay('preset-picker')

    expect(types()).toEqual(['preset-picker'])
  })

  it('compares presets by id, not by object', () => {
    ui().pushOverlay('subscription-form', { preset: netflix })
    ui().pushOverlay('subscription-form', { preset: { ...netflix } })

    expect(ui().overlays).toHaveLength(1)
  })

  it('opens a different screen of the same type', () => {
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })
    ui().pushOverlay('subscription-form', { subscriptionId: 'b' })
    ui().pushOverlay('subscription-form', { preset: netflix })
    ui().pushOverlay('subscription-form', { preset: spotify })
    ui().pushOverlay('subscription-form') // custom: no preset

    expect(ui().overlays).toHaveLength(5)
  })

  it('only compares with the top screen', () => {
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })
    ui().pushOverlay('preset-picker')
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })

    expect(ui().overlays).toHaveLength(3)
  })

  // Felipe's stress test: open A, back, open B fast showed B's header with A's form, because
  // B reused the key of A's screen while it was still sliding out
  it('gives every push a new id, even in the same place of the stack', () => {
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })
    const first = ui().overlays[0].id
    ui().popOverlay()
    ui().pushOverlay('subscription-form', { subscriptionId: 'b' })

    expect(ui().overlays[0].id).not.toBe(first)
  })

  it('opens the same screen again after closing it, with a new id', () => {
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })
    const first = ui().overlays[0].id
    ui().closeAllOverlays()
    ui().pushOverlay('subscription-form', { subscriptionId: 'a' })

    expect(ui().overlays).toHaveLength(1)
    expect(ui().overlays[0].id).not.toBe(first)
  })
})

describe('popOverlay and closeAllOverlays', () => {
  it('pop closes only the top screen', () => {
    ui().pushOverlay('preset-picker')
    ui().pushOverlay('subscription-form', { preset: netflix })
    ui().popOverlay()

    expect(types()).toEqual(['preset-picker'])
  })

  it('pop on an empty stack does nothing', () => {
    ui().popOverlay()

    expect(ui().overlays).toEqual([])
  })

  it('closeAllOverlays empties the stack', () => {
    ui().pushOverlay('preset-picker')
    ui().pushOverlay('subscription-form', { preset: netflix })
    ui().closeAllOverlays()

    expect(ui().overlays).toEqual([])
  })
})
