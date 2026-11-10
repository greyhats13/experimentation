import type { FinancialSummary } from '@/lib/types'

/**
 * Formats a numeric value as USD currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface SummaryCardsProps {
  readonly summary: FinancialSummary
}

/**
 * Renders top-level KPI summary cards for income, expenses, net cashflow, and savings rate.
 */
export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Monthly Income',
      value: formatCurrency(summary.totalIncome),
      subtext: 'Total gross inflows',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Monthly Outflows',
      value: formatCurrency(summary.totalExpenses),
      subtext: 'Needs + Wants + Allocated Savings',
      accent: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      label: 'Unallocated Cashflow',
      value: formatCurrency(summary.netCashflow),
      subtext: summary.netCashflow >= 0 ? 'Positive surplus' : 'Deficit warning',
      accent:
        summary.netCashflow >= 0
          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
          : 'text-amber-800 bg-amber-50 border-amber-300',
    },
    {
      label: 'Effective Savings Rate',
      value: `${summary.savingsRatePercent}%`,
      subtext: 'Target >= 20% of income',
      accent: 'text-sky-700 bg-sky-50 border-sky-200',
    },
  ] as const

  return (
    <section
      aria-label="Financial Overview Metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-5 shadow-xs ${card.accent}`}
        >
          <p className="text-xs font-semibold tracking-wider uppercase opacity-80">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-1 text-xs opacity-75">{card.subtext}</p>
        </div>
      ))}
    </section>
  )
}
