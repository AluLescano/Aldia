import React from 'react'

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Preferences, currencies, and backups</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase px-1">
          Currencies
        </span>
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 divide-y divide-zinc-800/60">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Default Currency</p>
              <p className="text-xs text-zinc-400">Currency used for monthly cost sums</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg">
              USD ($)
            </span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Favorite Currencies</p>
              <p className="text-xs text-zinc-400">Top 5 currencies in quick switcher</p>
            </div>
            <span className="text-xs text-indigo-400 font-medium">
              USD, EUR, ARS, BRL, GBP
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase px-1">
          Data & Storage
        </span>
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 divide-y divide-zinc-800/60">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Google Drive Backup</p>
              <p className="text-xs text-zinc-400">
                Sync offline data to private Google Drive storage
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-lg">
              Not Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Export / Import JSON</p>
              <p className="text-xs text-zinc-400">
                Save your subscriptions to a local file
              </p>
            </div>
            <button
              type="button"
              className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-all"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
