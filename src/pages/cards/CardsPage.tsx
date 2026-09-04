import React from 'react'

export const CardsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Payment Methods
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage mock credit cards and bank accounts
          </p>
        </div>
        <button
          type="button"
          className="p-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:scale-95 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {/* Mock Card Preview Sample */}
      <div className="relative h-48 w-full rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-700 to-cyan-600 p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Background glow and lines */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
            Mock Credit Card
          </span>
          <span className="text-sm font-bold tracking-widest">VISA</span>
        </div>

        <div>
          <p className="text-lg font-mono tracking-widest drop-shadow-sm">
            •••• •••• •••• 4242
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="block opacity-60 text-[10px] uppercase">Cardholder</span>
            <span className="font-semibold">Main Expenses</span>
          </div>
          <div>
            <span className="block opacity-60 text-[10px] uppercase">Expires</span>
            <span className="font-semibold font-mono">12/28</span>
          </div>
        </div>
      </div>
    </div>
  )
}
