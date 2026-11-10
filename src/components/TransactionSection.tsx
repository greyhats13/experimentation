'use client'

import { useState } from 'react'
import type {
  CreateTransactionInput,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '@/lib/types'
import { ALLOWED_CATEGORIES } from '@/lib/validation'
import { formatCurrency } from './SummaryCards'

interface TransactionSectionProps {
  readonly transactions: readonly Transaction[]
  readonly onAddTransaction: (input: CreateTransactionInput) => Promise<void>
  readonly onDeleteTransaction: (id: string) => Promise<void>
}

/**
 * Renders the transaction creation form and interactive cashflow ledger table.
 */
export function TransactionSection({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionSectionProps) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState<TransactionCategory>('groceries')
  const [date, setDate] = useState('2026-11-10')
  const [submitting, setSubmitting] = useState(false)

  /**
   * Handles form submission and delegates to parent handler.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onAddTransaction({
        title,
        amount: Number(amount),
        type,
        category,
        date,
      })
      setTitle('')
      setAmount('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-label="Income and Expense Ledger"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Income & Expense Ledger
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Record transactions to automatically update your 50/30/20 budget ratios.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-6"
      >
        <input
          type="text"
          required
          maxLength={80}
          placeholder="Description (e.g., Grocery Run)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          type="number"
          required
          min="1"
          step="0.01"
          placeholder="Amount ($)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {ALLOWED_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace('_', ' ')}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="py-2.5 pr-4">Date</th>
              <th className="py-2.5 pr-4">Description</th>
              <th className="py-2.5 pr-4">Category</th>
              <th className="py-2.5 pr-4">Bucket</th>
              <th className="py-2.5 pr-4 text-right">Amount</th>
              <th className="py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50">
                <td className="py-3 pr-4 whitespace-nowrap text-slate-500">
                  {tx.date}
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  {tx.title}
                </td>
                <td className="py-3 pr-4 capitalize text-slate-600">
                  {tx.category.replace('_', ' ')}
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
                    {tx.bucket}
                  </span>
                </td>
                <td
                  className={`py-3 pr-4 text-right font-semibold ${
                    tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => void onDeleteTransaction(tx.id)}
                    className="text-xs font-medium text-rose-600 hover:text-rose-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
