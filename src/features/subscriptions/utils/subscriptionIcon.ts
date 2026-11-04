// TYPES
import type { IconKey, Preset, SubscriptionIcon } from '@/shared/types'

/**
 * What to draw for a subscription's icon: an image `src`, a built-in `iconKey`, or neither
 * (the Avatar then shows the initial). The shape the Avatar and the card already take.
 *
 * A downloaded logo (`file`) has no `src` yet: the logo feature will turn its file name
 * into a path on the phone. Until then it shows the initial.
 */
export function iconSource(icon: SubscriptionIcon | undefined): {
  src?: string
  iconKey?: IconKey
} {
  switch (icon?.kind) {
    case 'preset':
      return { src: icon.path }
    case 'key':
      return { iconKey: icon.key }
    case 'file':
    case undefined:
      return {}
  }
}

/** A preset's logo, or its built-in icon, as a subscription icon. */
export function presetIcon(preset: Preset | undefined): SubscriptionIcon | undefined {
  if (preset?.iconUrl) return { kind: 'preset', path: preset.iconUrl }
  if (preset?.iconKey) return { kind: 'key', key: preset.iconKey }
  return undefined
}
