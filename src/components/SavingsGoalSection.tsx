'use client'

import { useState } from 'react'
import type { CreateSavingsGoalInput, SavingsGoal } from '@/lib/types'
import { formatCurrency } from './SummaryCards'

interface GoalCardProps {
  readonly goal: SavingsGoal
}

/**
 * Renders a single savings goal card with progress bar and monthly contribution target.
 */
function GoalCard({ goal }: GoalCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{goal.name}</h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
          {goal.progressPercent}% Complete
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Saved {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}{' '}
        • Target Date: {goal.targetDate}
      </p>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-700">
        Required Monthly Contribution:{' '}
        <span className="font-bold text-indigo-700">
          {formatCurrency(goal.monthlyContributionNeeded)}/mo
        </span>
      </p>
    </div>
  )
}

interface GoalFormProps {
  readonly onAddGoal: (input: CreateSavingsGoalInput) => Promise<void>
}

/**
 * Renders the controlled form to add a new savings goal.
 */
function GoalForm({ onAddGoal }: GoalFormProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('2027-12-01')
  const [submitting, setSubmitting] = useState(false)

  /**
   * Submits a new savings goal to the parent handler.
   */
  async function handleGoalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onAddGoal({
        name,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        targetDate,
      })
      setName('')
      setTargetAmount('')
      setCurrentAmount('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleGoalSubmit}
      className="mt-5 space-y-3 border-t border-slate-200 pt-4"
    >
      <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
        Add New Savings Goal
      </h3>
      <input
        type="text"
        required
        maxLength={80}
        placeholder="Goal Name (e.g., Home Downpayment)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          required
          min="1"
          placeholder="Target ($)"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <input
          type="number"
          required
          min="0"
          placeholder="Current Saved ($)"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          required
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Add Goal
        </button>
      </div>
    </form>
  )
}

interface SavingsGoalSectionProps {
  readonly goals: readonly SavingsGoal[]
  readonly onAddGoal: (input: CreateSavingsGoalInput) => Promise<void>
}

/**
 * Renders savings goals progress cards and a form to create new savings targets.
 */
export function SavingsGoalSection({ goals, onAddGoal }: SavingsGoalSectionProps) {
  return (
    <section
      aria-label="Savings Goals Planner"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Savings Goals & Monthly Target Calculator
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Track progress toward financial milestones and required monthly savings.
      </p>
      <div className="mt-4 space-y-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
      <GoalForm onAddGoal={onAddGoal} />
    </section>
  )
}
