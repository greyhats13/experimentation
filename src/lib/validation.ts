import type {
  CreateSavingsGoalInput,
  CreateTransactionInput,
  Result,
  TransactionCategory,
  TransactionType,
} from './types'

const ALLOWED_TYPES: readonly TransactionType[] = ['income', 'expense']

export const ALLOWED_CATEGORIES: readonly TransactionCategory[] = [
  'salary',
  'freelance',
  'investment',
  'housing',
  'groceries',
  'utilities',
  'transportation',
  'dining',
  'entertainment',
  'shopping',
  'emergency_fund',
  'retirement',
]

const MAX_TEXT_LENGTH = 80
const MAX_AMOUNT = 100_000_000
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Narrowing guard for plain objects at untrusted boundaries.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Strips HTML tags and angle brackets from untrusted string inputs to prevent XSS.
 */
export function sanitizeText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
}

/**
 * Checks whether a string is a valid TransactionType.
 */
function isTransactionType(value: unknown): value is TransactionType {
  return typeof value === 'string' && (ALLOWED_TYPES as readonly string[]).includes(value)
}

/**
 * Checks whether a string is a valid TransactionCategory.
 */
function isTransactionCategory(value: unknown): value is TransactionCategory {
  return (
    typeof value === 'string' &&
    (ALLOWED_CATEGORIES as readonly string[]).includes(value)
  )
}

/**
 * Checks whether a string is a valid YYYY-MM-DD calendar date.
 */
function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
    return false
  }
  const parsed = Date.parse(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed)
}

/**
 * Validates and sanitizes an untrusted transaction creation payload at the API boundary.
 */
export function validateTransactionInput(
  raw: unknown
): Result<CreateTransactionInput, string[]> {
  if (!isRecord(raw)) {
    return { ok: false, error: ['Payload must be a JSON object'] }
  }

  const errors: string[] = []
  const rawTitle = typeof raw['title'] === 'string' ? sanitizeText(raw['title']) : ''
  const rawAmount = raw['amount']
  const rawType = raw['type']
  const rawCategory = raw['category']
  const rawDate = raw['date']

  if (rawTitle.length === 0 || rawTitle.length > MAX_TEXT_LENGTH) {
    errors.push(`Title must be between 1 and ${MAX_TEXT_LENGTH} characters`)
  }
  if (
    typeof rawAmount !== 'number' ||
    !Number.isFinite(rawAmount) ||
    rawAmount <= 0 ||
    rawAmount > MAX_AMOUNT
  ) {
    errors.push(`Amount must be a positive number up to ${MAX_AMOUNT}`)
  }
  if (!isTransactionType(rawType)) {
    errors.push('Type must be either "income" or "expense"')
  }
  if (!isTransactionCategory(rawCategory)) {
    errors.push('Category is not in the allowed category list')
  }
  if (!isValidIsoDate(rawDate)) {
    errors.push('Date must be in YYYY-MM-DD format')
  }

  if (errors.length > 0) {
    return { ok: false, error: errors }
  }

  return {
    ok: true,
    value: {
      title: rawTitle,
      amount: Math.round((rawAmount as number) * 100) / 100,
      type: rawType as TransactionType,
      category: rawCategory as TransactionCategory,
      date: rawDate as string,
    },
  }
}

/**
 * Validates and sanitizes an untrusted savings goal creation payload at the API boundary.
 */
export function validateSavingsGoalInput(
  raw: unknown
): Result<CreateSavingsGoalInput, string[]> {
  if (!isRecord(raw)) {
    return { ok: false, error: ['Payload must be a JSON object'] }
  }

  const errors: string[] = []
  const rawName = typeof raw['name'] === 'string' ? sanitizeText(raw['name']) : ''
  const rawTarget = raw['targetAmount']
  const rawCurrent = raw['currentAmount']
  const rawDate = raw['targetDate']

  if (rawName.length === 0 || rawName.length > MAX_TEXT_LENGTH) {
    errors.push(`Goal name must be between 1 and ${MAX_TEXT_LENGTH} characters`)
  }
  if (
    typeof rawTarget !== 'number' ||
    !Number.isFinite(rawTarget) ||
    rawTarget <= 0 ||
    rawTarget > MAX_AMOUNT
  ) {
    errors.push('Target amount must be a positive number')
  }
  if (
    typeof rawCurrent !== 'number' ||
    !Number.isFinite(rawCurrent) ||
    rawCurrent < 0 ||
    rawCurrent > MAX_AMOUNT
  ) {
    errors.push('Current saved amount must be a non-negative number')
  }
  if (!isValidIsoDate(rawDate)) {
    errors.push('Target date must be in YYYY-MM-DD format')
  }

  if (errors.length > 0) {
    return { ok: false, error: errors }
  }

  return {
    ok: true,
    value: {
      name: rawName,
      targetAmount: Math.round((rawTarget as number) * 100) / 100,
      currentAmount: Math.round((rawCurrent as number) * 100) / 100,
      targetDate: rawDate as string,
    },
  }
}
