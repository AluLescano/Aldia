import React from 'react'

export const CalendarPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Calendar</h1>
        <p className="text-xs text-zinc-400 mt-1">
          View charges scheduled for each day of the month
        </p>
      </div>

      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 flex flex-col items-center justify-center text-center py-16">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-zinc-200">Interactive Calendar View</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          Charge days and card expiration dates will be displayed here in a monthly grid.
        </p>
      </div>
    </div>
  )
}
