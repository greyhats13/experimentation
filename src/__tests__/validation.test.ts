import { describe, it, expect } from 'vitest'
import {
  validateTransactionInput,
  validateSavingsGoalInput,
  sanitizeText,
} from '@/lib/validation'

describe('validation', () => {
  it('validates a legitimate transaction payload', () => {
    const result = validateTransactionInput({
      title: 'Monthly Salary',
      amount: 5000,
      type: 'income',
      category: 'salary',
      date: '2026-11-10',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.title).toBe('Monthly Salary')
      expect(result.value.amount).toBe(5000)
    }
  })

  it('rejects non-object or null transaction inputs', () => {
    expect(validateTransactionInput(null).ok).toBe(false)
    expect(validateTransactionInput('invalid').ok).toBe(false)
  })

  it('rejects empty title, negative amount, invalid type, category, or date', () => {
    const result = validateTransactionInput({
      title: '   ',
      amount: -50,
      type: 'crypto_hack',
      category: 'unknown_cat',
      date: '10-11-2026',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('strips dangerous HTML characters via sanitizeText', () => {
    const dirty = '<script>alert("xss")</script> Grocery & Co'
    const clean = sanitizeText(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).not.toContain('>')
    expect(clean).toContain('Grocery')
  })

  it('validates a legitimate savings goal payload', () => {
    const result = validateSavingsGoalInput({
      name: 'House Downpayment',
      targetAmount: 50000,
      currentAmount: 10000,
      targetDate: '2028-01-01',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('House Downpayment')
      expect(result.value.targetAmount).toBe(50000)
    }
  })

  it('rejects invalid savings goal payload', () => {
    const badNull = validateSavingsGoalInput(undefined)
    expect(badNull.ok).toBe(false)

    const badFields = validateSavingsGoalInput({
      name: '',
      targetAmount: 0,
      currentAmount: -10,
      targetDate: 'not-a-date',
    })
    expect(badFields.ok).toBe(false)
  })
})
