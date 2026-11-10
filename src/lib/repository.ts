import {
  appendTransactionImmutably,
  calculateSavingsGoalMetrics,
  mapCategoryToBucket,
  removeTransactionImmutably,
} from './finance-engine'
import type {
  CreateSavingsGoalInput,
  CreateTransactionInput,
  SavingsGoal,
  Transaction,
} from './types'

const INITIAL_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'seed-tx-1',
    title: 'Primary Tech Salary',
    amount: 8500,
    type: 'income',
    category: 'salary',
    bucket: 'savings',
    date: '2026-11-01',
  },
  {
    id: 'seed-tx-2',
    title: 'Apartment Rent & Utilities',
    amount: 2400,
    type: 'expense',
    category: 'housing',
    bucket: 'needs',
    date: '2026-11-02',
  },
  {
    id: 'seed-tx-3',
    title: 'Monthly Groceries',
    amount: 650,
    type: 'expense',
    category: 'groceries',
    bucket: 'needs',
    date: '2026-11-04',
  },
  {
    id: 'seed-tx-4',
    title: 'Weekend Dining & Coffee',
    amount: 420,
    type: 'expense',
    category: 'dining',
    bucket: 'wants',
    date: '2026-11-06',
  },
  {
    id: 'seed-tx-5',
    title: 'S&P 500 Index Contribution',
    amount: 1700,
    type: 'expense',
    category: 'retirement',
    bucket: 'savings',
    date: '2026-11-07',
  },
]

const INITIAL_GOALS: readonly SavingsGoal[] = [
  calculateSavingsGoalMetrics({
    id: 'seed-goal-1',
    name: '6-Month Emergency Fund',
    targetAmount: 18000,
    currentAmount: 12000,
    targetDate: '2027-05-01',
  }),
  calculateSavingsGoalMetrics({
    id: 'seed-goal-2',
    name: 'Japan Autumn Trip',
    targetAmount: 4500,
    currentAmount: 2250,
    targetDate: '2027-10-01',
  }),
]

let transactionsState: readonly Transaction[] = [...INITIAL_TRANSACTIONS]
let goalsState: readonly SavingsGoal[] = [...INITIAL_GOALS]

/**
 * Repository interface for managing financial transactions and savings goals immutably.
 */
export const financeRepository = {
  /**
   * Lists all transactions ordered by date descending.
   */
  findAllTransactions(): readonly Transaction[] {
    return [...transactionsState].sort((a, b) => b.date.localeCompare(a.date))
  },

  /**
   * Creates and stores a new transaction immutably.
   */
  createTransaction(input: CreateTransactionInput): Transaction {
    const newTx: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      title: input.title,
      amount: input.amount,
      type: input.type,
      category: input.category,
      bucket: mapCategoryToBucket(input.category),
      date: input.date,
    }
    transactionsState = appendTransactionImmutably(transactionsState, newTx)
    return newTx
  },

  /**
   * Deletes a transaction by ID immutably, returning true if found and removed.
   */
  deleteTransaction(id: string): boolean {
    const exists = transactionsState.some((tx) => tx.id === id)
    if (!exists) {
      return false
    }
    transactionsState = removeTransactionImmutably(transactionsState, id)
    return true
  },

  /**
   * Lists all savings goals.
   */
  findAllGoals(): readonly SavingsGoal[] {
    return [...goalsState]
  },

  /**
   * Creates and stores a new savings goal immutably.
   */
  createGoal(input: CreateSavingsGoalInput): SavingsGoal {
    const goal = calculateSavingsGoalMetrics({
      id: `goal-${crypto.randomUUID()}`,
      name: input.name,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount,
      targetDate: input.targetDate,
    })
    goalsState = [...goalsState, goal]
    return goal
  },
}

/**
 * Resets repository state to initial seed values for deterministic unit and integration testing.
 */
export function resetStoreForTesting(): void {
  transactionsState = [...INITIAL_TRANSACTIONS]
  goalsState = [...INITIAL_GOALS]
}
