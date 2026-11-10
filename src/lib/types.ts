/**
 * Core domain types and contracts for the Financial Planning Application.
 */

export type TransactionType = 'income' | 'expense'

export type BudgetBucket = 'needs' | 'wants' | 'savings'

export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'housing'
  | 'groceries'
  | 'utilities'
  | 'transportation'
  | 'dining'
  | 'entertainment'
  | 'shopping'
  | 'emergency_fund'
  | 'retirement'

export interface Transaction {
  readonly id: string
  readonly title: string
  readonly amount: number
  readonly type: TransactionType
  readonly category: TransactionCategory
  readonly bucket: BudgetBucket
  readonly date: string
}

export interface CreateTransactionInput {
  readonly title: string
  readonly amount: number
  readonly type: TransactionType
  readonly category: TransactionCategory
  readonly date: string
}

export interface SavingsGoal {
  readonly id: string
  readonly name: string
  readonly targetAmount: number
  readonly currentAmount: number
  readonly targetDate: string
  readonly monthlyContributionNeeded: number
  readonly progressPercent: number
}

export interface CreateSavingsGoalInput {
  readonly name: string
  readonly targetAmount: number
  readonly currentAmount: number
  readonly targetDate: string
}

export interface BudgetBucketAllocation {
  readonly targetPercent: number
  readonly targetAmount: number
  readonly actualAmount: number
  readonly actualPercent: number
  readonly remainingAmount: number
  readonly isOverBudget: boolean
}

export interface BudgetRuleBreakdown {
  readonly needs: BudgetBucketAllocation
  readonly wants: BudgetBucketAllocation
  readonly savings: BudgetBucketAllocation
}

export interface FinancialSummary {
  readonly totalIncome: number
  readonly totalExpenses: number
  readonly netCashflow: number
  readonly savingsRatePercent: number
  readonly budgetBreakdown: BudgetRuleBreakdown
  readonly categoryTotals: Readonly<Record<string, number>>
}

export type Result<T, E = string[]> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export interface ApiEnvelope<T> {
  readonly success: boolean
  readonly data: T | null
  readonly error: string | null
  readonly meta?: {
    readonly total: number
    readonly timestamp: string
  }
}
