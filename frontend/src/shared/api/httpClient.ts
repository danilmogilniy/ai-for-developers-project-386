import { env } from '../config/env'
import { isApiError } from './guards'
import type { ApiError } from './types'

export class HttpError extends Error {
  public readonly payload?: ApiError

  public constructor(message: string, payload?: ApiError) {
    super(message)
    this.name = 'HttpError'
    this.payload = payload
  }
}

const getErrorMessage = (payload: unknown): string => {
  if (isApiError(payload)) {
    return payload.message
  }

  return 'Failed to perform API request'
}

export const requestJson = async <TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> => {
  const baseHeaders = new Headers(init?.headers)
  if (init?.body !== undefined && !baseHeaders.has('Content-Type')) {
    baseHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: baseHeaders,
  })

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    throw new HttpError(getErrorMessage(payload), isApiError(payload) ? payload : undefined)
  }

  return (await response.json()) as TResponse
}
