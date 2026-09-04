import type { BillingCycle } from '@/shared/types'

export interface PresetSubscription {
  id: string
  name: string
  category: string
  defaultPrice: number
  defaultCurrency: string
  defaultCycle: BillingCycle
  brandColor: string
  iconSlug: string
}

export const PRESET_SUBSCRIPTIONS: PresetSubscription[] = [
  // Streaming & Video
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Entertainment',
    defaultPrice: 15.49,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#E50914',
    iconSlug: 'netflix',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Music',
    defaultPrice: 11.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#1DB954',
    iconSlug: 'spotify',
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: 'Entertainment',
    defaultPrice: 13.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#FF0000',
    iconSlug: 'youtube',
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    category: 'Entertainment',
    defaultPrice: 9.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#113CCF',
    iconSlug: 'disney',
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    category: 'Shopping',
    defaultPrice: 14.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#00A8E1',
    iconSlug: 'amazon',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    category: 'Music',
    defaultPrice: 10.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#FA243C',
    iconSlug: 'apple',
  },
  {
    id: 'max',
    name: 'Max (HBO)',
    category: 'Entertainment',
    defaultPrice: 9.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#002BE7',
    iconSlug: 'max',
  },

  // AI & Productivity
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    category: 'AI & Tools',
    defaultPrice: 20.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#10A37F',
    iconSlug: 'openai',
  },
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    category: 'AI & Tools',
    defaultPrice: 20.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#D97706',
    iconSlug: 'anthropic',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'Development',
    defaultPrice: 10.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#24292F',
    iconSlug: 'github',
  },
  {
    id: 'icloud',
    name: 'Apple iCloud+',
    category: 'Cloud Storage',
    defaultPrice: 2.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#38BDF8',
    iconSlug: 'cloud',
  },
  {
    id: 'google-one',
    name: 'Google One',
    category: 'Cloud Storage',
    defaultPrice: 1.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#4285F4',
    iconSlug: 'google',
  },
  {
    id: 'notion',
    name: 'Notion Plus',
    category: 'Productivity',
    defaultPrice: 8.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#000000',
    iconSlug: 'notion',
  },

  // Gaming
  {
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    category: 'Gaming',
    defaultPrice: 9.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#003791',
    iconSlug: 'playstation',
  },
  {
    id: 'xbox-game-pass',
    name: 'Xbox Game Pass',
    category: 'Gaming',
    defaultPrice: 16.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#107C10',
    iconSlug: 'xbox',
  },
  {
    id: 'nintendo-switch-online',
    name: 'Nintendo Switch Online',
    category: 'Gaming',
    defaultPrice: 19.99,
    defaultCurrency: 'USD',
    defaultCycle: 'yearly',
    brandColor: '#E60012',
    iconSlug: 'nintendo',
  },
]

export const DEFAULT_CATEGORIES = [
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#8B5CF6' },
  { id: 'music', name: 'Music', icon: 'music', color: '#10B981' },
  { id: 'tools', name: 'AI & Tools', icon: 'cpu', color: '#F59E0B' },
  { id: 'cloud', name: 'Cloud Storage', icon: 'cloud', color: '#06B6D4' },
  { id: 'gaming', name: 'Gaming', icon: 'gamepad', color: '#EC4899' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#3B82F6' },
  { id: 'utilities', name: 'Utilities', icon: 'zap', color: '#6366F1' },
  { id: 'health', name: 'Health & Fitness', icon: 'heart', color: '#EF4444' },
]
