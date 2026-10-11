import { create } from 'zustand'
import type { SubscriptionTemplate } from '@/shared/types'

export type OverlayType = 'preset-picker' | 'subscription-form'

interface OverlayContext {
  type: OverlayType
  data?: {
    preset?: SubscriptionTemplate
  }
}

interface UIState {
  overlays: OverlayContext[]
  pushOverlay: (type: OverlayType, data?: OverlayContext['data']) => void
  popOverlay: () => void
  closeAllOverlays: () => void
}

export const useUIStore = create<UIState>((set) => ({
  overlays: [],
  pushOverlay: (type, data) =>
    set((state) => ({
      overlays: [...state.overlays, { type, data }],
    })),
  popOverlay: () =>
    set((state) => ({
      overlays: state.overlays.slice(0, -1),
    })),
  closeAllOverlays: () => set({ overlays: [] }),
}))

