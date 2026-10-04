import React from 'react'

// COMPONENTS
import Button from '@/shared/ui/Button/Button'
import MonthlyExpenses from '@/features/homepage/components/MonthlyExpenses/MonthlyExpenses'
import Typography from '@/shared/ui/Typography/Typography'

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <MonthlyExpenses
        title="Gastos Mensuales"
        monthlyAmount="0,00"
        subscriptionAmount={0}
      />
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['Todas', 'Streaming', 'Trabajo', 'Almacenamiento', 'Música'].map((tab, idx) => (
          <Label key={idx}>
            <Typography variant="label" size="small">
              {tab}
            </Typography>
          </Label>
        ))}
      </div>

      {/* Subscription List Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <Typography variant="title">Tus subscripciones</Typography>
        </div>

        {/* Empty State placeholder */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border">
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
          <Typography variant="body" size="medium">
            Sin subscripciones aún
          </Typography>
          <Typography variant="body">
            Add your recurring expenses to keep track of payment days and your total
            budget.
          </Typography>
        </div>
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-30 px-5 flex justify-end">
        <div className="pointer-events-auto">
          <Button
            variant="primary"
            size="large"
            aria-label="Agregar Subscripción"
            onClick={() => console.log('Add subscription clicked')}
            className="!rounded-full !py-6"
          >
            <svg
              className="w-6 h-6"
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
          </Button>
        </div>
      </div>
    </div>
  )
}
