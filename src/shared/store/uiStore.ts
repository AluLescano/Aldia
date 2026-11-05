// DEPENDENCIES
import { create } from 'zustand'

// TYPES
import type { Preset } from '@/shared/types'

/** The full-screen layers that can open on top of the tabs. */
export type OverlayType = 'preset-picker' | 'subscription-form'

interface OverlayContext {
  /**
   * Unique for every push, used as the React key. Never reused, so a new screen can't take
   * over one that is still sliding out (it would keep the old screen's state, e.g. the form
   * values of the subscription opened before).
   */
  id: number
  type: OverlayType
  /** What the overlay needs: the picked preset (new) or the subscription to show (detail). */
  data?: {
    preset?: Preset
    subscriptionId?: string
  }
}

interface UIState {
  /** A stack: the last one is on top and is the one `App.tsx` shows. */
  overlays: OverlayContext[]
  /**
   * Opens an overlay on top of the current ones. Does nothing if the top one is already
   * the same screen (same type and data), so fast repeated taps open it only once.
   */
  pushOverlay: (type: OverlayType, data?: OverlayContext['data']) => void
  /** Closes the top overlay, showing the one below (back). */
  popOverlay: () => void
  /** Closes every overlay, back to the tabs. */
  closeAllOverlays: () => void
}

// Counts up for the whole session, so every overlay gets a new id
let lastOverlayId = 0

// Same screen: same type, same subscription, same preset (compared by id, not reference)
function isSameOverlay(
  overlay: OverlayContext,
  type: OverlayType,
  data: OverlayContext['data'],
) {
  return (
    overlay.type === type &&
    overlay.data?.subscriptionId === data?.subscriptionId &&
    overlay.data?.preset?.id === data?.preset?.id
  )
}

/** Screen navigation on top of the tabs: an overlay stack (no router in this app). */
export const useUIStore = create<UIState>((set) => ({
  overlays: [],
  pushOverlay: (type, data) =>
    set((state) => {
      const top = state.overlays.at(-1)
      if (top && isSameOverlay(top, type, data)) return state
      lastOverlayId += 1
      return { overlays: [...state.overlays, { id: lastOverlayId, type, data }] }
    }),
  popOverlay: () => set((state) => ({ overlays: state.overlays.slice(0, -1) })),
  closeAllOverlays: () => set({ overlays: [] }),
}))
