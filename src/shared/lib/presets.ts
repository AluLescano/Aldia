import type { BillingCycle } from "../types"

export interface PresetSubscription {
  id: string
  name: string
  defaultCategoryId: string    // references a Category.id
  defaultPrice: number         // suggested price — user can override
  defaultCurrency: string      // suggested currency
  defaultCycle: BillingCycle   // suggested cycle
  brandColor: string
  iconUrl: string              // path like '/logos/netflix.svg'
}

export const PRESET_SUBSCRIPTIONS: PresetSubscription[] = [
  // Streaming & Video
  {
    id: 'netflix',
    name: 'Netflix',
    defaultCategoryId: 'Entertainment',
    defaultPrice: 15.49,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    iconUrl: 'netflix',
    brandColor: '#E50914',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    defaultCategoryId: 'Music',
    defaultPrice: 11.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#1DB954',
    iconUrl: 'spotify',
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    defaultCategoryId: 'Entertainment',
    defaultPrice: 13.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#FF0000',
    iconUrl: 'youtube',
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    defaultCategoryId: 'Entertainment',
    defaultPrice: 9.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#113CCF',
    iconUrl: 'disney',
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    defaultCategoryId: 'Shopping',
    defaultPrice: 14.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#00A8E1',
    iconUrl: 'amazon',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    defaultCategoryId: 'Music',
    defaultPrice: 10.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#FA243C',
    iconUrl: 'apple',
  },
  {
    id: 'max',
    name: 'Max (HBO)',
    defaultCategoryId: 'Entertainment',
    defaultPrice: 9.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#002BE7',
    iconUrl: 'max',
  },

  // AI & Productivity
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    defaultCategoryId: 'AI & Tools',
    defaultPrice: 20.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#10A37F',
    iconUrl: 'openai',
  },
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    defaultCategoryId: 'AI & Tools',
    defaultPrice: 20.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#D97706',
    iconUrl: 'anthropic',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    defaultCategoryId: 'Development',
    defaultPrice: 10.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#24292F',
    iconUrl: 'github',
  },
  {
    id: 'icloud',
    name: 'Apple iCloud+',
    defaultCategoryId: 'Cloud Storage',
    defaultPrice: 2.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#38BDF8',
    iconUrl: 'cloud',
  },
  {
    id: 'google-one',
    name: 'Google One',
    defaultCategoryId: 'Cloud Storage',
    defaultPrice: 1.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#4285F4',
    iconUrl: 'google',
  },
  {
    id: 'notion',
    name: 'Notion Plus',
    defaultCategoryId: 'Productivity',
    defaultPrice: 8.0,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#000000',
    iconUrl: 'notion',
  },

  // Gaming
  {
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    defaultCategoryId: 'Gaming',
    defaultPrice: 9.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#003791',
    iconUrl: 'playstation',
  },
  {
    id: 'xbox-game-pass',
    name: 'Xbox Game Pass',
    defaultCategoryId: 'Gaming',
    defaultPrice: 16.99,
    defaultCurrency: 'USD',
    defaultCycle: 'monthly',
    brandColor: '#107C10',
    iconUrl: 'xbox',
  },
  {
    id: 'nintendo-switch-online',
    name: 'Nintendo Switch Online',
    defaultCategoryId: 'Gaming',
    defaultPrice: 19.99,
    defaultCurrency: 'USD',
    defaultCycle: 'yearly',
    brandColor: '#E60012',
    iconUrl: 'nintendo',
  },
]

export const DEFAULT_CATEGORIES = [
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#8B5CF6' },
  { id: 'music', name: 'Music', icon: 'music', color: '#10B981' },
  { id: 'ai', name: 'AI & Tools', icon: 'cpu', color: '#00eeff' },
  { id: 'cloud', name: 'Cloud Storage', icon: 'cloud', color: '#06B6D4' },
  { id: 'gaming', name: 'Gaming', icon: 'gamepad', color: '#9448ec' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-cart', color: '#ec9a00' },
  { id: 'utilities', name: 'Utilities', icon: 'zap', color: '#ffbe5d' },
  { id: 'health', name: 'Health & Fitness', icon: 'heart', color: '#d40000' },
]
