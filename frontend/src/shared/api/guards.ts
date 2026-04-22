import type {
  ApiError,
  NotFoundError,
  OutOfWindowError,
  SlotConflictError,
  ValidationError,
} from './types'

export const isApiError = (value: unknown): value is ApiError => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ApiError>
  return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}

export const isValidationError = (value: unknown): value is ValidationError =>
  isApiError(value) && value.code === 'VALIDATION_ERROR'

export const isNotFoundError = (value: unknown): value is NotFoundError =>
  isApiError(value) && value.code === 'NOT_FOUND'

export const isOutOfWindowError = (value: unknown): value is OutOfWindowError =>
  isApiError(value) && value.code === 'BOOKING_WINDOW_EXCEEDED'

export const isSlotConflictError = (value: unknown): value is SlotConflictError =>
  isApiError(value) && value.code === 'SLOT_ALREADY_BOOKED'
