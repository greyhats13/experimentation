'use client'

import { useEffect, useState, useCallback } from 'react'
import { BudgetRulePanel } from '@/components/BudgetRulePanel'
import { SavingsGoalSection } from '@/components/SavingsGoalSection'
import { SummaryCards } from '@/components/SummaryCards'
import { TransactionSection } from '@/components/TransactionSection'
import { calculateFinancialSummary } from '@/lib/finance-engine'
import type {
  CreateSavingsGoalInput,
  CreateTransactionInput,
  FinancialSummary,
  SavingsGoal,
  Transaction,
} from '@/lib/types'

/**
 * Renders the top navigation and header banner for the financial dashboard.
 */
function DashboardHeader() {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
      <div>
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
          50/30/20 Personal Finance Engine
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          FinPlan Cashflow & Goal Planner
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Track monthly cashflow, optimize 50/30/20 budget allocations, and forecast
          savings goals.
        </p>
      </div>
    </header>
  )
}

/**
 * Custom hook encapsulating dashboard data fetching and mutation handlers.
 */
function useFinancialDashboard() {
  const [transactions, setTransactions] = useState<readonly Transaction[]>([])
  const [summary, setSummary] = useState<FinancialSummary>(() =>
    calculateFinancialSummary([])
  )
  const [goals, setGoals] = useState<readonly SavingsGoal[]>([])
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      const [txRes, goalsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/goals'),
      ])
      const txJson = await txRes.json()
      const goalsJson = await goalsRes.json()
      if (txJson.success && txJson.data) {
        setTransactions(txJson.data.transactions)
        setSummary(txJson.data.summary)
      }
      if (goalsJson.success && goalsJson.data) {
        setGoals(goalsJson.data.goals)
      }
    } catch {
      setErrorBanner('Unable to load financial data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  /**
   * Sends a POST request to create a new transaction and refreshes dashboard state.
   */
  async function handleAddTransaction(input: CreateTransactionInput) {
    setErrorBanner(null)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(input),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      setErrorBanner(result.error ?? 'Failed to add transaction.')
      return
    }
    await loadDashboardData()
  }

  /**
   * Sends a DELETE request to remove a transaction and updates state immutably.
   */
  async function handleDeleteTransaction(id: string) {
    setErrorBanner(null)
    const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      setErrorBanner(result.error ?? 'Failed to remove transaction.')
      return
    }
    setTransactions(result.data.transactions)
    setSummary(result.data.summary)
  }

  /**
   * Sends a POST request to create a new savings goal and updates state immutably.
   */
  async function handleAddGoal(input: CreateSavingsGoalInput) {
    setErrorBanner(null)
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(input),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      setErrorBanner(result.error ?? 'Failed to create savings goal.')
      return
    }
    setGoals(result.data.goals)
  }

  return {
    transactions,
    summary,
    goals,
    errorBanner,
    loading,
    handleAddTransaction,
    handleDeleteTransaction,
    handleAddGoal,
  }
}

/**
 * Main Financial Planning Dashboard page component.
 */
export default function FinancialDashboardPage() {
  const {
    transactions,
    summary,
    goals,
    errorBanner,
    loading,
    handleAddTransaction,
    handleDeleteTransaction,
    handleAddGoal,
  } = useFinancialDashboard()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader />
      {errorBanner !== null && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {errorBanner}
        </div>
      )}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading financial planner...
        </div>
      ) : (
        <div className="space-y-8">
          <SummaryCards summary={summary} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <BudgetRulePanel breakdown={summary.budgetBreakdown} />
            <SavingsGoalSection goals={goals} onAddGoal={handleAddGoal} />
          </div>
          <TransactionSection
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      )}
    </main>
  )
}
