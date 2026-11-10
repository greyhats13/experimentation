import type { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-response'
import { calculateFinancialSummary } from '@/lib/finance-engine'
import { financeRepository } from '@/lib/repository'
import { checkRateLimit, verifyCsrfAndOrigin } from '@/lib/security'
import { validateTransactionInput } from '@/lib/validation'

const SAFE_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/

/**
 * Handles GET /api/transactions to return all transactions and calculated financial summary.
 */
export async function GET(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return createErrorResponse('Too many requests. Please try again later.', 429)
  }

  const transactions = financeRepository.findAllTransactions()
  const summary = calculateFinancialSummary(transactions)

  return createSuccessResponse(
    { transactions, summary },
    200,
    transactions.length
  )
}

/**
 * Handles POST /api/transactions to validate and record a new income or expense transaction.
 */
export async function POST(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return createErrorResponse('Too many requests. Please try again later.', 429)
  }

  if (!verifyCsrfAndOrigin(request)) {
    return createErrorResponse('Forbidden: CSRF or Origin verification failed.', 403)
  }

  try {
    const rawBody: unknown = await request.json()
    const validation = validateTransactionInput(rawBody)

    if (!validation.ok) {
      return createErrorResponse(validation.error.join('; '), 400)
    }

    const transaction = financeRepository.createTransaction(validation.value)
    const allTransactions = financeRepository.findAllTransactions()
    const summary = calculateFinancialSummary(allTransactions)

    return createSuccessResponse(
      { transaction, summary },
      201,
      allTransactions.length
    )
  } catch {
    return createErrorResponse('Invalid JSON request body.', 400)
  }
}

/**
 * Handles DELETE /api/transactions?id=<id> to remove an existing transaction.
 */
export async function DELETE(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return createErrorResponse('Too many requests. Please try again later.', 429)
  }

  if (!verifyCsrfAndOrigin(request)) {
    return createErrorResponse('Forbidden: CSRF or Origin verification failed.', 403)
  }

  const id = request.nextUrl.searchParams.get('id')
  if (id === null || !SAFE_ID_REGEX.test(id)) {
    return createErrorResponse('Valid transaction ID parameter is required.', 400)
  }

  const deleted = financeRepository.deleteTransaction(id)
  if (!deleted) {
    return createErrorResponse('Transaction not found.', 404)
  }

  const transactions = financeRepository.findAllTransactions()
  const summary = calculateFinancialSummary(transactions)

  return createSuccessResponse({ transactions, summary }, 200, transactions.length)
}
