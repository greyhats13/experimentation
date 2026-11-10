import type { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-response'
import { financeRepository } from '@/lib/repository'
import { checkRateLimit, verifyCsrfAndOrigin } from '@/lib/security'
import { validateSavingsGoalInput } from '@/lib/validation'

/**
 * Handles GET /api/goals to list all savings goals and their monthly contribution metrics.
 */
export async function GET(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return createErrorResponse('Too many requests. Please try again later.', 429)
  }

  const goals = financeRepository.findAllGoals()
  return createSuccessResponse({ goals }, 200, goals.length)
}

/**
 * Handles POST /api/goals to validate and create a new savings goal.
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
    const validation = validateSavingsGoalInput(rawBody)

    if (!validation.ok) {
      return createErrorResponse(validation.error.join('; '), 400)
    }

    const goal = financeRepository.createGoal(validation.value)
    const goals = financeRepository.findAllGoals()

    return createSuccessResponse({ goal, goals }, 201, goals.length)
  } catch {
    return createErrorResponse('Invalid JSON request body.', 400)
  }
}
