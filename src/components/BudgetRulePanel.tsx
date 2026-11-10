import type { BudgetBucketAllocation, BudgetRuleBreakdown } from '@/lib/types'
import { formatCurrency } from './SummaryCards'

interface BucketRowProps {
  readonly title: string
  readonly description: string
  readonly bucket: BudgetBucketAllocation
  readonly barColor: string
}

/**
 * Renders a single 50/30/20 budget bucket row with progress bar and variance badge.
 */
function BucketRow({ title, description, bucket, barColor }: BucketRowProps) {
  const barWidth = Math.min(100, Math.max(0, bucket.actualPercent))

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(bucket.actualAmount)}
          </span>
          <span className="text-xs text-slate-500">
            {' '}
            / {formatCurrency(bucket.targetAmount)} ({bucket.actualPercent}% vs{' '}
            {bucket.targetPercent}%)
          </span>
        </div>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-600">
          {bucket.remainingAmount >= 0
            ? `${formatCurrency(bucket.remainingAmount)} remaining in target`
            : `${formatCurrency(Math.abs(bucket.remainingAmount))} above target`}
        </span>
        {bucket.isOverBudget ? (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-medium text-rose-800">
            Over Target
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-800">
            On Track
          </span>
        )}
      </div>
    </div>
  )
}

interface BudgetRulePanelProps {
  readonly breakdown: BudgetRuleBreakdown
}

/**
 * Displays the 50/30/20 budget rule analysis for Needs, Wants, and Savings.
 */
export function BudgetRulePanel({ breakdown }: BudgetRulePanelProps) {
  return (
    <section
      aria-label="50/30/20 Budget Rule Analysis"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          50 / 30 / 20 Budget Rule Analyzer
        </h2>
        <p className="text-sm text-slate-600">
          Compares your actual monthly allocations against the standard 50% Needs,
          30% Wants, and 20% Savings benchmark.
        </p>
      </div>

      <div className="space-y-4">
        <BucketRow
          title="Needs (50% Target)"
          description="Housing, groceries, utilities, essential transportation"
          bucket={breakdown.needs}
          barColor={breakdown.needs.isOverBudget ? 'bg-rose-600' : 'bg-indigo-600'}
        />
        <BucketRow
          title="Wants (30% Target)"
          description="Dining out, entertainment, discretionary shopping"
          bucket={breakdown.wants}
          barColor={breakdown.wants.isOverBudget ? 'bg-rose-600' : 'bg-amber-500'}
        />
        <BucketRow
          title="Savings & Investments (20% Target)"
          description="Emergency fund, retirement contributions, index funds"
          bucket={breakdown.savings}
          barColor="bg-emerald-600"
        />
      </div>
    </section>
  )
}
