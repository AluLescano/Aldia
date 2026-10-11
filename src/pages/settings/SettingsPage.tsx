import React from 'react'
import styles from './SettingsPage.module.scss'

export const SettingsPage: React.FC = () => {
  const {
    container,
    title,
    subtitle,
    section,
    sectionTitle,
    list,
    listItem,
    itemTitle,
    itemDesc,
    badge,
    textValue,
    badgeDisabled,
    button,
  } = styles

  return (
    <div className={container}>
      <div>
        <h1 className={title}>Settings</h1>
        <p className={subtitle}>Preferences, currencies, and backups</p>
      </div>

      <div className={section}>
        <span className={sectionTitle}>
          Currencies
        </span>
        <div className={list}>
          <div className={listItem}>
            <div>
              <p className={itemTitle}>Default Currency</p>
              <p className={itemDesc}>Currency used for monthly cost sums</p>
            </div>
            <span className={badge}>
              USD ($)
            </span>
          </div>

          <div className={listItem}>
            <div>
              <p className={itemTitle}>Favorite Currencies</p>
              <p className={itemDesc}>Top 5 currencies in quick switcher</p>
            </div>
            <span className={textValue}>
              USD, EUR, ARS, BRL, GBP
            </span>
          </div>
        </div>
      </div>

      <div className={section}>
        <span className={sectionTitle}>
          Data & Storage
        </span>
        <div className={list}>
          <div className={listItem}>
            <div>
              <p className={itemTitle}>Google Drive Backup</p>
              <p className={itemDesc}>
                Sync offline data to private Google Drive storage
              </p>
            </div>
            <span className={badgeDisabled}>
              Not Connected
            </span>
          </div>

          <div className={listItem}>
            <div>
              <p className={itemTitle}>Export / Import JSON</p>
              <p className={itemDesc}>
                Save your subscriptions to a local file
              </p>
            </div>
            <button
              type="button"
              className={button}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
