import { create } from 'zustand'

interface ToastData {
  id: number
  message: string
  type: 'success' | 'alert' | 'info'
}

interface ToastState {
  toast: ToastData | null
  showToast: (message: string, type: ToastData['type']) => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (message, type) => set({ toast: { id: Date.now(), message, type } }),
  hideToast: () => set({ toast: null }),
}))
