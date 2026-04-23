export const APP_TIME_ZONE = 'Europe/Moscow'
export const APP_TIME_OFFSET = '+03:00'
export const APP_CALENDAR_TIME_ZONE = APP_TIME_OFFSET

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const getMoscowDateKey = (value: Date = new Date()): string => {
  const parts = dateKeyFormatter.formatToParts(value)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Failed to format date for Europe/Moscow')
  }

  return `${year}-${month}-${day}`
}

export const fromMoscowDateKey = (dateKey: string, time = '00:00:00.000'): string =>
  `${dateKey}T${time}${APP_TIME_OFFSET}`
