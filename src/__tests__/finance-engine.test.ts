import { describe, it, expect } from 'vitest'
import {
  mapCategoryToBucket,
  calculateBudgetBreakdown,
  calculateFinancialSummary,
  calculateSavingsGoalMetrics,
  appendTransactionImmutably,
  removeTransactionImmutably,
} from '@/lib/finance-engine'
import type { Transaction } from '@/lib/types'

const SAMPLE_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'tx-1',
    title: 'Monthly Salary',
    amount: 10000,
    type: 'income',
    category: 'salary',
    bucket: 'savings',
    date: '2026-11-01',
  },
  {
    id: 'tx-2',
    title: 'Apartment Rent',
    amount: 3500,
    type: 'expense',
    category: 'housing',
    bucket: 'needs',
    date: '2026-11-02',
  },
  {
    id: 'tx-3',
    title: 'Dining Out',
    amount: 1200,
    type: 'expense',
    category: 'dining',
    bucket: 'wants',
    date: '2026-11-03',
  },
  {
    id: 'tx-4',
    title: 'Index Fund Transfer',
    amount: 2000,
    type: 'expense',
    category: 'retirement',
    bucket: 'savings',
    date: '2026-11-04',
  },
]

describe('finance-engine', () => {
  it('maps categories to their correct 50/30/20 budget bucket', () => {
    expect(mapCategoryToBucket('housing')).toBe('needs')
    expect(mapCategoryToBucket('groceries')).toBe('needs')
    expect(mapCategoryToBucket('utilities')).toBe('needs')
    expect(mapCategoryToBucket('transportation')).toBe('needs')
    expect(mapCategoryToBucket('dining')).toBe('wants')
    expect(mapCategoryToBucket('entertainment')).toBe('wants')
    expect(mapCategoryToBucket('shopping')).toBe('wants')
    expect(mapCategoryToBucket('emergency_fund')).toBe('savings')
    expect(mapCategoryToBucket('retirement')).toBe('savings')
    expect(mapCategoryToBucket('salary')).toBe('savings')
  })

  it('calculates 50/30/20 budget breakdown accurately from transactions', () => {
    const breakdown = calculateBudgetBreakdown(SAMPLE_TRANSACTIONS)

    expect(breakdown.needs.targetAmount).toBe(5000)
    expect(breakdown.needs.actualAmount).toBe(3500)
    expect(breakdown.needs.actualPercent).toBe(35)
    expect(breakdown.needs.isOverBudget).toBe(false)

    expect(breakdown.wants.targetAmount).toBe(3000)
    expect(breakdown.wants.actualAmount).toBe(1200)
    expect(breakdown.wants.actualPercent).toBe(12)
    expect(breakdown.wants.isOverBudget).toBe(false)

    expect(breakdown.savings.targetAmount).toBe(2000)
    expect(breakdown.savings.actualAmount).toBe(2000)
    expect(breakdown.savings.actualPercent).toBe(20)
  })

  it('flags over-budget buckets when spending exceeds 50% or 30% thresholds', () => {
    const highWants: readonly Transaction[] = [
      ...SAMPLE_TRANSACTIONS,
      {
        id: 'tx-5',
        title: 'Luxury Gadget',
        amount: 2500,
        type: 'expense',
        category: 'shopping',
        bucket: 'wants',
        date: '2026-11-05',
      },
    ]

    const breakdown = calculateBudgetBreakdown(highWants)
    expect(breakdown.wants.actualAmount).toBe(3700)
    expect(breakdown.wants.isOverBudget).toBe(true)
  })

  it('handles zero income gracefully without division-by-zero NaN', () => {
    const summary = calculateFinancialSummary([])
    expect(summary.totalIncome).toBe(0)
    expect(summary.totalExpenses).toBe(0)
    expect(summary.netCashflow).toBe(0)
    expect(summary.savingsRatePercent).toBe(0)
    expect(summary.budgetBreakdown.needs.actualPercent).toBe(0)
  })

  it('computes complete financial summary including category totals', () => {
    const summary = calculateFinancialSummary(SAMPLE_TRANSACTIONS)
    expect(summary.totalIncome).toBe(10000)
    expect(summary.totalExpenses).toBe(6700)
    expect(summary.netCashflow).toBe(3300)
    expect(summary.savingsRatePercent).toBe(53)
    expect(summary.categoryTotals['housing']).toBe(3500)
    expect(summary.categoryTotals['dining']).toBe(1200)
  })

  it('calculates savings goal monthly contribution and progress percent', () => {
    const goal = calculateSavingsGoalMetrics(
      {
        id: 'goal-1',
        name: 'Emergency Fund',
        targetAmount: 12000,
        currentAmount: 3000,
        targetDate: '2027-08-01',
      },
      new Date('2026-11-01T00:00:00Z')
    )

    expect(goal.progressPercent).toBe(25)
    expect(goal.monthlyContributionNeeded).toBe(1000)
  })

  it('handles completed or past-due savings goals safely', () => {
    const completedGoal = calculateSavingsGoalMetrics(
      {
        id: 'goal-2',
        name: 'Laptop Fund',
        targetAmount: 2000,
        currentAmount: 2500,
        targetDate: '2026-10-01',
      },
      new Date('2026-11-01T00:00:00Z')
    )

    expect(completedGoal.progressPercent).toBe(100)
    expect(completedGoal.monthlyContributionNeeded).toBe(0)
  })

  it('enforces immutability when appending or removing transactions', () => {
    const original: readonly Transaction[] = [SAMPLE_TRANSACTIONS[0]!]
    const nextTx = SAMPLE_TRANSACTIONS[1]!

    const afterAdd = appendTransactionImmutably(original, nextTx)
    expect(original.length).toBe(1)
    expect(afterAdd.length).toBe(2)
    expect(afterAdd).not.toBe(original)

    const afterRemove = removeTransactionImmutably(afterAdd, 'tx-1')
    expect(afterAdd.length).toBe(2)
    expect(afterRemove.length).toBe(1)
    expect(afterRemove[0]?.id).toBe('tx-2')
  })
})
