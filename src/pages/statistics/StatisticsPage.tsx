import React from 'react'

export const StatisticsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Analytics</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cost distribution and category breakdown
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
              d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-zinc-200">Category Expense Analysis</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          Visual percentages of your monthly spending by category (Entertainment, Cloud,
          AI, etc.) will appear here.
        </p>
      </div>
    </div>
  )
}
