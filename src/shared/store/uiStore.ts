// DEPENDENCIES
import { create } from 'zustand'

// TYPES
import type { Preset } from '@/shared/types'

/** The full-screen layers that can open on top of the tabs. */
export type OverlayType = 'preset-picker' | 'subscription-form'

interface OverlayContext {
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
  /** Opens an overlay on top of the current ones. */
  pushOverlay: (type: OverlayType, data?: OverlayContext['data']) => void
  /** Closes the top overlay, showing the one below (back). */
  popOverlay: () => void
  /** Closes every overlay, back to the tabs. */
  closeAllOverlays: () => void
}

/** Screen navigation on top of the tabs: an overlay stack (no router in this app). */
export const useUIStore = create<UIState>((set) => ({
  overlays: [],
  pushOverlay: (type, data) =>
    set((state) => ({ overlays: [...state.overlays, { type, data }] })),
  popOverlay: () => set((state) => ({ overlays: state.overlays.slice(0, -1) })),
  closeAllOverlays: () => set({ overlays: [] }),
}))
