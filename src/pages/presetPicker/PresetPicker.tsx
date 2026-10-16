// DEPENDENCIES
import { useState } from 'react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'

// UTILS
import { normalizeText } from '@/shared/lib/normalizeText'
import { cn } from '@/shared/lib/cn'

// DATA
import { PRESET_SUBSCRIPTIONS } from '@/features/subscriptions/data/presets'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import IconButton from '@/shared/ui/IconButton/IconButton'
import PresetCard from '@/features/subscriptions/components/PresetCard/PresetCard'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconSearch } from '@/assets/icons/IconSearch'

import styles from './PresetPicker.module.scss'

/**
 * Full-screen overlay for adding a subscription: search the presets (by name or by
 * company, ignoring accents and case) and tap one, or tap `+` for a custom one.
 * Either way it pushes the `subscription-form` overlay on top.
 */
export const PresetPicker = () => {
  const { container, header, searchbar, listContainer, presetGrid } = styles
  const popOverlay = useUIStore((state) => state.popOverlay)
  const pushOverlay = useUIStore((state) => state.pushOverlay)

  const [searchTerm, setSearchTerm] = useState('')

  const term = normalizeText(searchTerm)
  const filteredPresets = PRESET_SUBSCRIPTIONS.filter((sub) =>
    [sub.name, ...(sub.keywords ?? [])].some((text) =>
      normalizeText(text).includes(term),
    ),
  )

  return (
    <div className={container}>
      <header className={header}>
        <div>
          <IconButton onClick={popOverlay} label="Volver">
            <IconArrow />
          </IconButton>
          <Typography variant="title" size="small">
            Agregar Subscripción
          </Typography>
          <IconButton
            onClick={() => pushOverlay('subscription-form')}
            label="Crear subscripción personalizada"
          >
            <IconAdd />
          </IconButton>
        </div>

        {/* Search Bar */}
        <div className={searchbar}>
          <input
            type="text"
            placeholder="Buscar Subscripción"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div>
            <IconSearch />
          </div>
        </div>
      </header>

      <div className={cn(listContainer, `no-scrollbar`)}>
        <div>
          <Typography variant="label" size="small">
            Subscripciones Populares
          </Typography>
        </div>

        {/* Grid */}
        <div className={presetGrid}>
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              name={preset.name}
              logo={preset.iconUrl}
              iconKey={preset.iconKey}
              onClick={() => pushOverlay('subscription-form', { preset })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
