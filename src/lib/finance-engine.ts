import type {
  BudgetBucket,
  BudgetBucketAllocation,
  BudgetRuleBreakdown,
  FinancialSummary,
  SavingsGoal,
  Transaction,
  TransactionCategory,
} from './types'

const NEEDS_RATIO = 0.5
const WANTS_RATIO = 0.3
const SAVINGS_RATIO = 0.2
const PERCENT_MULTIPLIER = 100
const MILLISECONDS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.4375

const CATEGORY_BUCKET_MAP: Readonly<Record<TransactionCategory, BudgetBucket>> = {
  salary: 'savings',
  freelance: 'savings',
  investment: 'savings',
  housing: 'needs',
  groceries: 'needs',
  utilities: 'needs',
  transportation: 'needs',
  dining: 'wants',
  entertainment: 'wants',
  shopping: 'wants',
  emergency_fund: 'savings',
  retirement: 'savings',
}

/**
 * Maps a transaction category to its 50/30/20 budget bucket.
 */
export function mapCategoryToBucket(category: TransactionCategory): BudgetBucket {
  return CATEGORY_BUCKET_MAP[category]
}

/**
 * Computes a single budget bucket's target vs actual allocation.
 */
function buildBucketAllocation(
  totalIncome: number,
  targetRatio: number,
  actualAmount: number,
  isSavingsBucket = false
): BudgetBucketAllocation {
  const targetPercent = Math.round(targetRatio * PERCENT_MULTIPLIER)
  const targetAmount = Math.round(totalIncome * targetRatio * 100) / 100
  const actualPercent =
    totalIncome > 0
      ? Math.round((actualAmount / totalIncome) * PERCENT_MULTIPLIER)
      : 0
  const remainingAmount = Math.round((targetAmount - actualAmount) * 100) / 100
  const isOverBudget = isSavingsBucket ? false : actualAmount > targetAmount && totalIncome > 0

  return {
    targetPercent,
    targetAmount,
    actualAmount,
    actualPercent,
    remainingAmount,
    isOverBudget,
  }
}

/**
 * Calculates the 50/30/20 budget breakdown from an immutable list of transactions.
 */
export function calculateBudgetBreakdown(
  transactions: readonly Transaction[]
): BudgetRuleBreakdown {
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense')

  const needsActual = expenseTransactions
    .filter((tx) => tx.bucket === 'needs')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const wantsActual = expenseTransactions
    .filter((tx) => tx.bucket === 'wants')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const savingsActual = expenseTransactions
    .filter((tx) => tx.bucket === 'savings')
    .reduce((sum, tx) => sum + tx.amount, 0)

  return {
    needs: buildBucketAllocation(totalIncome, NEEDS_RATIO, needsActual),
    wants: buildBucketAllocation(totalIncome, WANTS_RATIO, wantsActual),
    savings: buildBucketAllocation(totalIncome, SAVINGS_RATIO, savingsActual, true),
  }
}

/**
 * Calculates total income, expenses, net cashflow, savings rate, and category totals.
 */
export function calculateFinancialSummary(
  transactions: readonly Transaction[]
): FinancialSummary {
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const explicitSavings = transactions
    .filter((tx) => tx.type === 'expense' && tx.bucket === 'savings')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const netCashflow = Math.round((totalIncome - totalExpenses) * 100) / 100
  const effectiveSavings = Math.max(0, netCashflow) + explicitSavings
  const savingsRatePercent =
    totalIncome > 0
      ? Math.min(100, Math.round((effectiveSavings / totalIncome) * PERCENT_MULTIPLIER))
      : 0

  const categoryTotals = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce<Record<string, number>>((acc, tx) => {
      const current = acc[tx.category] ?? 0
      return {
        ...acc,
        [tx.category]: Math.round((current + tx.amount) * 100) / 100,
      }
    }, {})

  return {
    totalIncome,
    totalExpenses,
    netCashflow,
    savingsRatePercent,
    budgetBreakdown: calculateBudgetBreakdown(transactions),
    categoryTotals,
  }
}

/**
 * Computes progress percentage and required monthly savings contribution for a goal.
 */
export function calculateSavingsGoalMetrics(
  goalInput: {
    readonly id: string
    readonly name: string
    readonly targetAmount: number
    readonly currentAmount: number
    readonly targetDate: string
  },
  referenceDate: Date = new Date()
): SavingsGoal {
  const rawPercent =
    goalInput.targetAmount > 0
      ? (goalInput.currentAmount / goalInput.targetAmount) * PERCENT_MULTIPLIER
      : 0
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawPercent)))

  const remaining = Math.max(0, goalInput.targetAmount - goalInput.currentAmount)
  const targetTime = new Date(`${goalInput.targetDate}T00:00:00Z`).getTime()
  const diffMonths = Math.max(
    1,
    Math.round((targetTime - referenceDate.getTime()) / MILLISECONDS_PER_MONTH)
  )

  const monthlyContributionNeeded =
    remaining > 0 ? Math.round((remaining / diffMonths) * 100) / 100 : 0

  return {
    ...goalInput,
    monthlyContributionNeeded,
    progressPercent,
  }
}

/**
 * Returns a new transaction array with the provided transaction prepended immutably.
 */
export function appendTransactionImmutably(
  transactions: readonly Transaction[],
  newTransaction: Transaction
): readonly Transaction[] {
  return [...transactions, newTransaction]
}

/**
 * Returns a new transaction array with the matching transaction ID removed immutably.
 */
export function removeTransactionImmutably(
  transactions: readonly Transaction[],
  transactionId: string
): readonly Transaction[] {
  return transactions.filter((tx) => tx.id !== transactionId)
}
