// DEPENDENCIES
import { useState } from 'react'

// ZUSTAND
import { useUIStore } from '@/shared/store/uiStore'

// DATA
import { PRESET_SUBSCRIPTIONS } from '@/shared/lib/presets'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import PresetCard from '@/features/subscriptions/components/PresetCard/PresetCard'

// ASSETS
import { IconArrowLeft } from '@/assets/icons/IconArrowLeft'
import { IconAdd } from '@/assets/icons/IconAdd'
import { IconSearch } from '@/assets/icons/IconSearch'

import styles from './PresetPicker.module.scss'

export const PresetPicker = () => {
  const {container, header, searchbar, button, listContainer, presetGrid} = styles
  const popOverlay = useUIStore((state) => state.popOverlay)
  const pushOverlay = useUIStore((state) => state.pushOverlay)

  const [searchTerm, setSearchTerm] = useState('')

  // Filter presets based on search
  const filteredPresets = PRESET_SUBSCRIPTIONS.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div
      className={container}
    >
      <header className={header}>
        <div>
          <Button
            size="small"
            onClick={popOverlay}
            className={button}
          >
            <IconArrowLeft />
          </Button>
          <Typography variant="title" size="small">
            Agregar Subscripción
          </Typography>
          <Button
            size="small"
            onClick={() => pushOverlay('subscription-form')}
            className={button}
          >
            <IconAdd />
          </Button>
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

      <div className={`${listContainer} no-scrollbar`}>
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
              onClick={() => pushOverlay('subscription-form', { preset })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
