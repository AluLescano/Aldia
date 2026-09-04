import React from 'react'

interface HomePageProps {
  onNewSubscription?: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ onNewSubscription }) => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Monthly Total Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-zinc-900 to-zinc-950 p-6 border border-indigo-500/20 shadow-xl shadow-indigo-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Monthly Expenses
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            USD ($)
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white">$0.00</span>
          <span className="text-sm text-zinc-400">/ month</span>
        </div>

        <p className="mt-2 text-xs text-zinc-400">0 active subscriptions tracked</p>

        {/* Action Button to Add Subscription */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onNewSubscription}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-medium py-3 px-4 rounded-2xl shadow-md shadow-indigo-600/25 transition-all text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Subscription
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['All', 'Entertainment', 'Work', 'Cloud', 'Music'].map((tab, idx) => (
          <button
            key={tab}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              idx === 0
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subscription List Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-zinc-200">Your Subscriptions</h2>
          <span className="text-xs text-zinc-500">Sorted by charge date</span>
        </div>

        {/* Empty State placeholder */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/30">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-800">
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
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-300">No subscriptions yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Add your recurring expenses to keep track of payment days and your total
            budget.
          </p>
        </div>
      </div>
    </div>
  )
}
