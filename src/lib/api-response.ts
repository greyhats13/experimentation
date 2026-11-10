import { NextResponse } from 'next/server'
import type { ApiEnvelope } from './types'

/**
 * Creates a standardized JSON success response envelope.
 */
export function createSuccessResponse<T>(
  data: T,
  status = 200,
  total?: number
): NextResponse<ApiEnvelope<T>> {
  const body: ApiEnvelope<T> = {
    success: true,
    data,
    error: null,
    ...(total !== undefined
      ? {
          meta: {
            total,
            timestamp: new Date().toISOString(),
          },
        }
      : {}),
  }

  return NextResponse.json(body, { status })
}

/**
 * Creates a standardized JSON error response envelope with scrubbed messages.
 */
export function createErrorResponse(
  message: string,
  status = 400
): NextResponse<ApiEnvelope<null>> {
  const body: ApiEnvelope<null> = {
    success: false,
    data: null,
    error: message,
  }

  return NextResponse.json(body, { status })
}
