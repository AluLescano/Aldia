import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.katyadesign.aldia',
  appName: 'Aldia',
  webDir: 'dist',
  // Same as the splash ($charcoal-900): no white flash while React loads
  backgroundColor: '#0a0f0c',
  plugins: {
    LocalNotifications: {
      // The bell in android/app/src/main/res/drawable (white outline, Android tints it)
      smallIcon: 'ic_stat_aldia',
      // Brand green that reads on light and dark notification shades ($phthalo-400)
      iconColor: '#228A5C',
    },
  },
}

export default config
